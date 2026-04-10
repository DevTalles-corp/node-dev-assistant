export type Role = "user" | "assistant";
export interface Message
{
    role: Role;
    content: string;
}
export interface ToolDefinition
{
    name:string;
    description: string;
    input_schema:
    {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    }
}
export interface ToolResult
{
    toolName: string;
    toolUseId:string;
    result:string;
    isError: boolean;
}