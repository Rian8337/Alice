import "module-alias/register";
import { config } from "dotenv";
import { Bot } from "@alice-core/Bot";
process.env.UV_THREADPOOL_SIZE = "128";

config();

const bot: Bot = new Bot();

bot.start();
