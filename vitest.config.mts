import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = (name: string, directory: string) => ({
    find: new RegExp(`^@${name}/`),
    replacement: fileURLToPath(new URL(`./src/${directory}/`, import.meta.url)),
});

export default defineConfig({
    resolve: {
        // Mirrors `compilerOptions.paths` in `tsconfig.json`.
        alias: [
            alias("core", "core"),
            alias("database", "database"),
            alias("enums", "enums"),
            alias("events", "events"),
            alias("interactions", "interactions"),
            alias("localization", "localization"),
            alias("structures", "structures"),
            alias("utils", "utils"),
        ],
    },
    test: {
        include: ["src/**/*.test.ts"],
    },
});
