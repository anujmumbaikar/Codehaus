import { inngest } from "./client";
import { openai, createAgent, anthropic } from "@inngest/agent-kit";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },

  async ({ event, step }) => {
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert nextjs developer.  You write reaable , maintainable code , you wirte simple nextjs snippets. like simple button , navbar, input , form, etc",
      model: openai({ model: "gpt-4o"}),
    });

    const {output} = await codeAgent.run(
      `Write the following snippets:${event.data.value}`,
    )

    return { output};
  },
);
