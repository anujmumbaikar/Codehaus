import { inngest } from "./client";
import { openai, createAgent, anthropic, createTool, createNetwork, type Tool } from "@inngest/agent-kit";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandbox, lastAssistentTextMessageContent } from "./utils";
import z from "zod";
import { PROMPT } from "@/prompt";
import prisma from "@/lib/db";

interface AgentResponse {
  summary: string;
  files:{
    [path:string]:string
  };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },

  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("codehaus-nextjs-test")
      return sandbox.sandboxId;
    })
    const codeAgent = createAgent<AgentResponse>({
      name: "code-agent",
      system: PROMPT,
      description:"An expert coding agent",
      model: openai({ 
        model: "gpt-4.1-mini",
        defaultParameters:{
          temperature: 0.1,
        }
      }),
      tools:[
        createTool({
          name:"terminal",
          description:"Use the terminal to run the commands",
          parameters: z.object({
            command:z.string(),
          }),
          handler: async ({command},{step})=>{
            return await step?.run("terminal",async()=>{
              const buffers = {stdout:"", stderr:""}
              try {
                const sandbox = await getSandbox(sandboxId);
                // check E2B docs , for running commands in terminal inside sandbox
                const result = await sandbox.commands.run(command,{
                  onStdout:(data:string)=>{
                    buffers.stdout += data;
                  },
                  onStderr:(data:string)=>{
                    buffers.stderr += data;
                  }
                });
                return result.stdout;
              } catch (error) {
                console.log(`Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`);
                //  we are returning the error message to the agent , so that it can handle it
                // for e.g. if something gets wrong , we know we get a error message ,so our Agent understands that
                // and retry with something different command.
                return `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
              }
            })
          }
        }),
        createTool({
          name:"createOrUpdateFiles",
          description:"create and update files in the sandbox",
          parameters: z.object({
            files:z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({files},{step,network}:Tool.Options<AgentResponse>)=>{
            const newFiles = await step?.run("create-or-update-files", async () => {
              try {
                const updateFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updateFiles[file.path] = file.content;
                }
                return updateFiles
              } catch (error) {
                return `Error creating or updating files: ${error}`;
              }
            });
            if(typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          }
        }),
        createTool({
          name:"readFiles",
          description:"read files from the sandbox",
          parameters: z.object({
            files:z.array(z.string()),
          }),
          handler: async ({files},{step,network})=>{
            return await step?.run("read-files", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({path:file,content});
                }
                return JSON.stringify(contents);
              } catch (error) {
                return `Error reading files: ${error}`;
              }
            });
          }
        }),
      ],
      lifecycle:{
        onResponse: async({result,network})=>{
          const lastAssistentMessageText = lastAssistentTextMessageContent(result)

          if(lastAssistentMessageText && network){
            if( lastAssistentMessageText.includes("<task_summary>")){
              network.state.data.summary = lastAssistentMessageText
            }
          }
          return result;
        }
      }
    });

    const network = createNetwork<AgentResponse>({
      name: "codehaus-network",
      agents:[codeAgent],
      maxIter: 15,
      router:async ({network}) =>{
        const summary = network.state.data.summary;
        if(summary){
          return
        }
        return codeAgent
      }
    })
    // now insted of running the agent , we will run the network now.
    // const {output} = await codeAgent.run(
    //   `Write the following snippets:${event.data.value}`,
    // )
    const result = await network.run(event.data.value);

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000)
      return `https://${host}`;
    })

    await step.run("save-result", async () => {
      if(isError){
        return await prisma.message.create({
          data:{
            projectId: event.data.projectId,
            content:result.state.data.summary || "No summary generated",
            role: "ASSISTANT",
            type:"ERROR",
          }
        })
      }
      return await prisma.message.create({
        data:{
          projectId: event.data.projectId,
          content:result.state.data.summary,
          role: "ASSISTANT",
          type:"RESULT",
          Fragment:{
            create:{
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: result.state.data.files,
            }
          }
        }
      })
    })

    return { 
      url : sandboxUrl,
      title: "Fragment",
      files: network.state.data.files,
      summary: network.state.data.summary,
    };
  },
);
