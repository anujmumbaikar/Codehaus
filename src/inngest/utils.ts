import {Sandbox} from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
    const sandbox = await Sandbox.connect(sandboxId);
    await sandbox.setTimeout(600_000);
    if (!sandbox) {
        throw new Error(`Sandbox with ID ${sandboxId} not found`);
    }
    return sandbox;
}

export function lastAssistentTextMessageContent(result:AgentResult){
    const lastAssistentTextMessageIndex = result.output.findLastIndex(
        (message) => message.role === "assistant",
    );
    const message = result.output[lastAssistentTextMessageIndex] as | TextMessage | undefined;

    return message?.content ?
        typeof message.content === "string" ? message.content : message.content.map((c)=> c.text).join("")
        : undefined;
}