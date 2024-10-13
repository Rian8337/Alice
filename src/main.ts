import "module-alias/register";
import { config } from "dotenv";
import { Bot } from "@alice-core/Bot";
process.env.UV_THREADPOOL_SIZE = "128";

config();

const bot = new Bot();

bot.start().catch((e) => {
    console.error(e);
    process.exit(1);
});
