import { inngest } from "./client";
import {
  openai,
  createAgent,
  anthropic,
  createTool,
  createNetwork,
  type Tool,
  type Message,
  createState
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistentTextMessageContent } from "./utils";
import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import prisma from "@/lib/db";
import { consumeCredits } from "@/lib/useageTracker";

interface AgentResponse {
  summary: string;
  files: {
    [path: string]: string;
  };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run"},
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("codehaus-nextjs-test");
      await sandbox.setTimeout(600_000)
      return sandbox.sandboxId;
    });
    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = [];
      const messages = await prisma.message.findMany({
        where:{
          projectId: event.data.projectId,
        },
        orderBy:{
          createdAt: "desc",
        },
        take:5,
      });
      for(const message of messages) {
        formattedMessages.push({
          type:"text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content:message.content,
        });
      }
      return formattedMessages.reverse();
    })
    const state = createState<AgentResponse>(
      {
        summary:"",
        files:{},
      },
      {
        messages: previousMessages,
      }
    )
    const codeAgent = createAgent<AgentResponse>({
      name: "code-agent",
      system: PROMPT,
      description: "An expert coding agent",
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      // model: anthropic({
      //   model: "claude-3-5-sonnet-20240620",
      //   defaultParameters:{
      //     temperature: 0.1,
      //     max_tokens: 8192,
      //   }
      // }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run the commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                // check E2B docs , for running commands in terminal inside sandbox
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.log(
                  `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                );
                //  we are returning the error message to the agent , so that it can handle it
                // for e.g. if something gets wrong , we know we get a error message ,so our Agent understands that
                // and retry with something different command.
                return `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "create and update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentResponse>
          ) => {
            const newFiles = await step?.run(
              "create-or-update-files",
              async () => {
                try {
                  const updateFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updateFiles[file.path] = file.content;
                  }
                  return updateFiles;
                } catch (error) {
                  return `Error creating or updating files: ${error}`;
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step, network }) => {
            return await step?.run("read-files", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return `Error reading files: ${error}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistentMessageText =
            lastAssistentTextMessageContent(result);

          if (lastAssistentMessageText && network) {
            if (lastAssistentMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistentMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentResponse>({
      name: "codehaus-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });
    // now insted of running the agent , we will run the network now.
    // const {output} = await codeAgent.run(
    //   `Write the following snippets:${event.data.value}`,
    // )
    const result = await network.run(event.data.value,{state});

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      system: FRAGMENT_TITLE_PROMPT,
      description: "Generate a title for the code fragment",
      model: openai({
        model: "gpt-4.1-nano",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
    })
    const ResponseGenerator = createAgent({
      name: "response-generator",
      system: RESPONSE_PROMPT,
      description: "Generate a response for the user",
      model: openai({
        model: "gpt-4o-mini",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
    })
    const {output:fragmentTitleOutput} = await fragmentTitleGenerator.run(result.state.data.summary)
    const {output:responseOutput} = await ResponseGenerator.run(result.state.data.summary);


    const generateFragmentTitle = ()=>{
      if(fragmentTitleOutput[0].type !== "text") {
        return "Fragment"
      }
      if(Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((item) => item).join(" ");
      }else{
        return fragmentTitleOutput[0].content;
      }
    }
    const generateResponse = (value:Message[])=>{
      const output = value[0]
      if(output.type !== "text") {
        return "Here's what I built for you."
      }
      if(Array.isArray(output.content)) {
        return output.content.map((item) => item).join(" ");
      }else{
        return output.content;
      }
    }
    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: result.state.data.summary || "No summary generated",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          Fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            }, 
          }, 
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: network.state.data.files,
      summary: network.state.data.summary,
    };
  }
);
