import * as fs from "fs/promises";
import * as path from "path";
import type { Chunk } from "../types.js";

const MAX_CHUNK_SIZE = 2000;
