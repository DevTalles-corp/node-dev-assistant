import * as fs from "fs/promises";
import * as path from "path";
import { ToolDefinition } from "../types.js";
import { retrieveContext } from "../rag/retriever.js";

// === Definiciones de las 2 tools nuevas ===

const SEARCH_DOCS_TOOL: ToolDefinition = {
  name: "search_docs",
  description:
    "Busca información en la documentación ingestada usando búsqueda semántica. " +
    "Úsala cuando el usuario pregunta sobre cómo usar una API, conceptos del sistema, " +
    "o cualquier información que podría estar en los docs técnicos del proyecto. " +
    "Requiere que los documentos estén cargados con el comando /ingest. " +
    "Retorna los fragmentos más relevantes con su fuente y sección.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "La pregunta o tema a buscar en la documentación.",
      },
      top_k: {
        type: "number",
        description:
          "Número de fragmentos a recuperar (default: 5, máximo: 10).",
      },
    },
    required: ["query"],
  },
};
const CREATE_ISSUE_TOOL: ToolDefinition = {
  name: "create_issue",
  description:
    "Crea un issue o tarea en el directorio ./issues/ del proyecto. " +
    "Úsala cuando el usuario quiera reportar un bug, registrar una mejora, " +
    "o crear una tarea de seguimiento. " +
    "Los issues se guardan como archivos Markdown con numeración automática.",
  input_schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Título conciso del issue.",
      },
      description: {
        type: "string",
        description: "Descripción detallada del problema o tarea.",
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description:
          "Etiquetas opcionales (ej: ['bug', 'enhancement', 'documentation']).",
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Prioridad del issue (default: medium).",
      },
    },
    required: ["title", "description"],
  },
};

async function executeSearchDocs(params: {
  query: string;
  top_k?: number;
}): Promise<string> {
  try {
    const topK = Math.min(params.top_k ?? 5, 10);
    const chunks = await retrieveContext(params.query, topK);
    if (chunks.length === 0) {
      return (
        "No se encontraron documentos relevantes para esta consulta" +
        "Asegúrate de haber ingestado documentación con el comando /ingest"
      );
    }
    const results = chunks
      .map((chunk) => {
        const source = chunk.metadata.source;
        const section = chunk.metadata.heading;
        const score = (chunk.score * 100).toFixed(0);
        return `[FUENTE: ${source} | Sección: ${section} | Relevancia: ${score}%\n${chunk.content}]`;
      })
      .join("\n\n---\n\n");
    return `Se econtraron ${chunks.length} fragmentos relevantes:\n\n${results}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Error al buscar en la documentación: ${message}`;
  }
}
