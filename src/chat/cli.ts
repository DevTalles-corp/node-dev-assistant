import * as readline from 'readline';
import { Conversation } from './conversation.js';
import { DOCUMENTATION_ASSISTANT_PROMPT } from '../llm/prompts.js';

export async function startCLI(): Promise<void>
{
    const rl = readline.createInterface(
        {
            input: process.stdin,
            output: process.stdout
        }
    )
    const conversation = new Conversation(DOCUMENTATION_ASSISTANT_PROMPT);
    console.log("╔════════════════════════════════════════╗");
    console.log("║          DevAssistant v0.1             ║");
    console.log("║    Asistente de Documentación IA       ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("");
    console.log("💬 Escribe tu pregunta y presiona Enter.");
    console.log("   Comandos: /clear, /stats, /exit");
    console.log("");
    const promptUser = ():void =>
    {
        rl.question("Tú: ",(input) =>{
            const userInput = input.trim();
            if(!userInput)
            {
                promptUser();
                return;
            }
            if (userInput === "/stats") {
                const stats = conversation.getStats();
                console.log(`\n📊 Estadísticas de la conversación:`);
                console.log(`   • Turnos: ${stats.turns}`);
                console.log(`   • Tokens de entrada acumulados: ${stats.inputTokens}`);
                console.log(`   • Tokens de salida acumulados: ${stats.outputTokens}`);
                console.log(`   • Tokens estimados en contexto actual: ${conversation.estimateCurrentTokens()}\n`);
                promptUser();
                return;
            }
            if (userInput === "/exit" || userInput === "/salida") {
                const stats = conversation.getStats();
                console.log(` Resumen: ${stats.turns} turnos `+
                    `${stats.inputTokens} tokens de entrada` +
                    `${stats.outputTokens} tokens de salida` 
                );
                rl.close();
                return;
            }
            if(userInput === "/clear" || userInput === "/limpiar")
            {
                conversation.clear();
                promptUser();
                return;
            }
            

        });
    };
}