import { Snowflake } from "discord.js";

/**
 * Represents an information about a role's mute permission.
 */
export interface RoleMutePermission {
    /**
     * The ID of the role.
     */
    id: Snowflake;

    /**
     * The maximum time the role can mute a user. If the role can
     * permanently mute a user, this will be -1.
     */
    maxTime: number;
}
