import { Snowflake } from "discord.js";

/**
 * Represents an information about a role's timeout permission.
 */
export interface RoleTimeoutPermission {
    /**
     * The ID of the role.
     */
    id: Snowflake;

    /**
     * The maximum time the role can timeout a user.
     */
    maxTime: number;
}
