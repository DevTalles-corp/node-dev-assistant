import Anthropic from "@anthropic-ai/sdk";
import type { ToolDefinition } from "../types.js";
import { TOOL_DEFINITIONS } from "./definitions.js";

const MAX_ITERATIONS = 10;

export async function runWithTools(
  prompt: string,
  systemPrompt?: string,
  tools?: ToolDefinition[],
): Promise<string> {
  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: prompt },
  ];
  const sdkTools = (tools ?? TOOL_DEFINITIONS) as Anthropic.Messages.Tool[];
}
