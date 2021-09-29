import { Snowflake } from "discord.js";

/**
 * Represents a cooldown key of a command.
 * 
 * Format: `{user ID}:{channel ID}:{command name}`
 */
export type CooldownKey = `${Snowflake}:${Snowflake}:${string}`;