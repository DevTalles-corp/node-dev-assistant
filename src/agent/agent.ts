import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPT } from "./system-prompt.js";
import { AgentResponse } from "../types.js";
import { ALL_TOOL_DEFINITIONS } from "./tool-registry.js";

const MAX_TOOL_CALLS = 8;
export class DevAssistantAgent {
  private messages: Anthropic.Messages.MessageParam[] = [];
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;
  private turns: number = 0;
  private toolCallsLastTurn: number = 0;

  constructor(private readonly systemPrompt: string = AGENT_SYSTEM_PROMPT) {}

  async chat(
    userMessage: string,
    onChunk?: (fragment: string) => void,
  ): Promise<AgentResponse> {
    this.turns++;
    this.toolCallsLastTurn = 0;
    const toolsUsed: string[] = [];
    let inputTokensThisTurn = 0;
    let outputTokensThisTurn = 0;

    this.messages.push({ role: "user", content: userMessage });
    console.log(`\nAgente procesando turno ${this.turns}...`);
    const sdkTools = ALL_TOOL_DEFINITIONS as Anthropic.Messages.Tool[];
  }
}
