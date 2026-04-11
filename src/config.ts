import { config as loadDotenv } from "dotenv";

loadDotenv();

function getRequiredEnvVar(name: string, defaultValue?: string): string
{
    const value = process.env[name] ?? defaultValue;
    if(value === undefined)
    {
        throw new Error(`Variable de entorno requerida no encontrada: ${name}`);
    }
    return value;
}

function validateProvider(provider: string): "anthropic" | "openai"
{
    if(provider === "anthropic" || provider === "openai")
    {
        return provider;
    }
    throw new Error(`MODEL_PROVIDER inválido: ${provider}. Debe ser "anthropic" o "openai"`);
    
}
