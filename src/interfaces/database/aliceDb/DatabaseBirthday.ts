import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents an information about a Discord user's birthday.
 */
export interface DatabaseBirthday extends BaseDocument {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * The birthday date of the user, ranging from 1 to the maximum date of the month.
     */
    date: number;

    /**
     * The birthday month of the user, ranging from 0 to 11.
     */
    month: number;

    /**
     * The timezone of the user, ranging from -12 to 14.
     */
    timezone: number;

    /**
     * Whether the user was born in leap year.
     */
    isLeapYear: boolean;
}