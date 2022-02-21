import { Language } from "@alice-localization/base/Language";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a user's locale.
 */
export interface DatabaseUserLocale extends BaseDocument {
    /**
     * The ID of the user.
     */
    discordId: Snowflake;

    /**
     * The locale of the user.
     */
    locale: Language;
}