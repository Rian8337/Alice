import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseUserLocale } from "@alice-interfaces/database/aliceDb/DatabaseUserLocale";
import { Language } from "@alice-localization/base/Language";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "mongodb";

/**
 * Represents a user's locale.
 */
export class UserLocale extends Manager implements DatabaseUserLocale {
    discordId: string;
    locale: Language;
    readonly _id?: ObjectId;

    constructor(data: DatabaseUserLocale = DatabaseManager.aliceDb?.collections.userLocale.defaultDocument ?? {}) {
        super();

        this._id = data._id;
        this.discordId = data.discordId;
        this.locale = data.locale;
    }
}