import { PermissionString } from "discord.js";

/**
 * A permission handle for commands.
 */
export type Permission = PermissionString | "BOT_OWNER" | "SPECIAL";
