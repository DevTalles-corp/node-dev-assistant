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