import "module-alias/register";
import { config } from "dotenv";
import { Bot } from "@alice-core/Bot";
import { watch } from "chokidar";
import { join } from "path";
import consola from "consola";
process.env.UV_THREADPOOL_SIZE = "128";

config();

// Reload .env file when it changes.
watch(join(process.cwd(), ".env"), {
    awaitWriteFinish: true,
    ignoreInitial: true,
}).on("change", () => {
    config();

    consola.info("Reloaded .env file.");
});

const bot = new Bot();

bot.start();
