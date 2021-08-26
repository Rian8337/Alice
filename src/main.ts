import 'module-alias/register';
import { config } from 'dotenv';
import { Bot } from '@alice-core/Bot';

config();

const bot: Bot = new Bot();

bot.start(true);