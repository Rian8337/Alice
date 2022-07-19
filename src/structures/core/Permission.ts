import { PermissionsString } from "discord.js";

/**
 * A permission handle for commands.
 */
export type Permission = PermissionsString | "BotOwner" | "Special";
