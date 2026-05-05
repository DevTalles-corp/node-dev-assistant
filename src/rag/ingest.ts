import * as fs from "fs/promises";
import * as path from "path";
import config from "../config.js";
import { processDirectory } from "./chunker.js";
import { generateEmbeddings } from "./embeddings.js";

const PREVIEW_JSON = path.join(
  path.dirname(config.dbPath),
  "chunks-preview.json",
);

export async function runIngest(
  docsPath: string = config.docsPath,
): Promise<void> {
  console.log("Iniciando la ingestión de documentos..");
  console.log(`Directorio: ${docsPath}`);
  console.log("");

  const chunks = await processDirectory(docsPath);
  if (chunks.length === 0) {
    console.log("No se encuentran archivos .md en el directorio");
  }
  console.log(`Total de chunks generados ${chunks.length}`);
  console.log(`Generando embeddings para ${chunks.length} chunks...`);
  const texts = chunks.map((chunk) => chunk.content);
  const embeddings = await generateEmbeddings(texts);
  const dimensions = embeddings[0]?.length ?? 0;
  console.log(`Embeddings generados ${dimensions} dimensiones c/u`);
}
