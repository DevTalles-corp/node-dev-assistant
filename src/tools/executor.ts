import { dir } from "console";
import * as fs from "fs/promises";
import * as path from "path";

const PROJECT_ROOT = process.cwd();

const MAX_FILE_SIZE = 50_000;

const MAX_SEARCH_RESULTS = 20;

const CONTEXT_LINES = 2;

function resolveSecurePath(tagetPath: string): string| null
{
    const absolutePath = path.resolve(PROJECT_ROOT, tagetPath);
    const projectwithSep = PROJECT_ROOT + path.sep;
    if(!absolutePath.startsWith(projectwithSep) && absolutePath !== PROJECT_ROOT)
    {
        return null;
    }
    return absolutePath;
}

async function collectFiles(dirPath:string,extension?:string): Promise<string[]> {
    const results: string[] = [];
    let entries;
    try {
        entries = await fs.readdir(dirPath, { withFileTypes: true});
    } catch {
        return results;
    }

    for(const entry of entries)
    {
        if(entry.name === "node_modules" || entry.name.startsWith("."))
        {
            continue;
        }
        const fullPath = path.join(dirPath, entry.name);
        if(entry.isDirectory())
        {
            const subFiles = await collectFiles(fullPath, extension);
            results.push(...subFiles);
        }else if(entry.isFile())
        {
            if(!extension || entry.name.endsWith(extension))
            {
                results.push(fullPath);
            }
        }
    }
    return results;
}


async function executeListFiles(params: {
    path: string,
    extension?: string
}): Promise<string>{
    const securePath = resolveSecurePath(params.path);
    if(!securePath)
        {
            return `Error de seguridad: la ruta "${params.path}" intenta acceder fuera del proyecto.`
        }
    try {
        const stat = await fs.stat(securePath);
        if(!stat.isDirectory())
        {
            return `Error: ${params.path} no es un directorio.`
        }
    } catch  {
        return `Error: el directorio ${params.path} no existe.`
    }

    const files = await collectFiles(securePath, params.extension);
    if(files.length === 0 )
    {
        const filterFile = params.extension ? ` con extensión ${params.extension}`:"";
        return `No se encontraron archivos${filterFile} en "${params.path}"`;
    }
    const relativePaths = files.map((file) => path.relative(PROJECT_ROOT, file));
    return relativePaths.join("\\n");
}

async function executeReadFile(params:
    {
        file_path:string
    }
):Promise<string>{
    const securePath = resolveSecurePath(params.file_path);
    if(!securePath)
        {
            return `Error de seguridad: la ruta "${params.file_path}" intenta acceder fuera del proyecto.`
        }
    try {
        const stat = await fs.stat(securePath);
        if(stat.isDirectory())
        {
            return `Error: ${params.file_path} es un directorio, no un archivo.`
        }

        if(stat.size > MAX_FILE_SIZE)
        {
            return ` Archivo demasiado grande (${stat.size} bytes) `+
                    `Considera leer una sección en especifico.`
        }
        const content = await fs.readFile(securePath,"utf-8");
        if(content.length > MAX_FILE_SIZE)
        {
            return content.slice(0, MAX_FILE_SIZE) + "\\n\\n... [archivo truncado]";
        }
        return content;


    } catch(error)  {
        const err = error as NodeJS.ErrnoException;
        if(err.code === "ENOENT")
        {
            return `Error: el archivo ${params.file_path} no existe.`
        }
          return `Error al leer el archivo ${params.file_path}.`
        
    }
}