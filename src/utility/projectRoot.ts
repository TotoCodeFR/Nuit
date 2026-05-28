import { existsSync } from "node:fs";
import { join, dirname } from "node:path";

let cached: string | null = null;

export function getProjectRoot(): string {
    if (cached) return cached;

    let current = import.meta.dirname;
    while (true) {
        if (existsSync(join(current, "package.json"))) {
            cached = current;
            return current;
        }
        const parent = dirname(current);
        if (parent === current) throw new Error("Could not find project root");
        current = parent;
    }
}
