import { Snowflake } from "discord.js";

/**
 * Represents a cooldown key of a command.
 * 
 * Format: `{User ID}:{command name}`
 */
export type CooldownKey = `${Snowflake}:${string}`;