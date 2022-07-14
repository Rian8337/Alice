import { Snowflake } from "discord.js";

/**
 * Represents a cooldown key of a command in a channel.
 *
 * Format: `{user ID}:{channel ID}:{command name}`
 */
export type ChannelCooldownKey = `${Snowflake}:${Snowflake}:${string}`;

/**
 * Represents a cooldown key of a command in a channel.
 *
 * Format: `{user ID}:{command name}`
 */
export type GlobalCooldownKey = `${Snowflake}:${string}`;
