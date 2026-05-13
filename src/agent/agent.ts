import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPT } from "./system-prompt.js";
import { AgentResponse } from "../types.js";
import { ALL_TOOL_DEFINITIONS } from "./tool-registry.js";
import { client } from "../llm/anthropic-client.js";
import config from "../config.js";

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
    while (this.toolCallsLastTurn < MAX_TOOL_CALLS) {
      const response = await client.messages.create({
        model: config.anthropicModel,
        max_tokens: 4096,
        system: this.systemPrompt,
        tools: sdkTools,
        messages: this.messages,
      });
      inputTokensThisTurn += response.usage.input_tokens;
      outputTokensThisTurn += response.usage.output_tokens;
      this.totalInputTokens += response.usage.input_tokens;
      this.totalOutputTokens += response.usage.output_tokens;
      if (response.stop_reason === "end_turn") {
        const finalText = response.content
          .filter(
            (block): block is Anthropic.Messages.TextBlock =>
              block.type === "text",
          )
          .map((block) => block.text)
          .join("\n");
        if (onChunk) {
          const stream = await client.messages.stream({
            model: config.anthropicModel,
            max_tokens: 4096,
            system: this.systemPrompt,
            tools: sdkTools,
            messages: this.messages,
          });
          let streamedText = "";
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              onChunk(event.delta.text);
              streamedText += event.delta.text;
            }
          }
          this.messages.push({
            role: "assistant",
            content: streamedText || finalText,
          });
          console.log("Respuesta final generada\n");
          return {
            text: streamedText || finalText,
            toolsUsed,
            inputTokens: inputTokensThisTurn,
            outputTokens: outputTokensThisTurn,
          };
        } else {
          this.messages.push({
            role: "assistant",
            content: finalText,
          });
          console.log("Respuesta final generada\n");
          return {
            text: finalText,
            toolsUsed,
            inputTokens: inputTokensThisTurn,
            outputTokens: outputTokensThisTurn,
          };
        }
      }
    }
  }
}
