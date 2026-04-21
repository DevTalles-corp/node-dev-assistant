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
        if(entry.name === "node-modules" || entry.name.startsWith("."))
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