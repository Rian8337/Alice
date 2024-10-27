import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseUserLocale } from "structures/database/aliceDb/DatabaseUserLocale";
import { Language } from "@localization/base/Language";
import { Manager } from "@utils/base/Manager";
import { ObjectId } from "mongodb";

/**
 * Represents a user's locale.
 */
export class UserLocale extends Manager implements DatabaseUserLocale {
    discordId: string;
    locale: Language;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseUserLocale = DatabaseManager.aliceDb?.collections
            .userLocale.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.discordId = data.discordId;
        this.locale = data.locale;
    }
}
