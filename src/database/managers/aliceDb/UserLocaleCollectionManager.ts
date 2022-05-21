import { UserLocale } from "@alice-database/utils/aliceDb/UserLocale";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseUserLocale } from "@alice-interfaces/database/aliceDb/DatabaseUserLocale";
import { Language } from "@alice-localization/base/Language";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { Snowflake } from "discord.js";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `userlocale` collection.
 */
export class UserLocaleCollectionManager extends DatabaseCollectionManager<
    DatabaseUserLocale,
    UserLocale
> {
    protected override readonly utilityInstance: new (
        data: DatabaseUserLocale
    ) => UserLocale = UserLocale;

    override get defaultDocument(): DatabaseUserLocale {
        return {
            discordId: "",
            locale: "en",
        };
    }

    /**
     * Gets a user's preferred locale.
     *
     * @param userId The ID of the user.
     * @returns The user's preferred locale, `null` if not found.
     */
    getUserLocale(userId: Snowflake): Promise<UserLocale | null> {
        return this.getOne({ discordId: userId });
    }

    /**
     * Sets a user's preferred locale.
     *
     * @param userId The ID of the user.
     * @param language The language to set the user's preferred locale to.
     * @returns An object containing information about the operation.
     */
    setUserLocale(
        userId: Snowflake,
        language: Language
    ): Promise<OperationResult> {
        if (CacheManager.userLocale.has(userId)) {
            CacheManager.userLocale.set(userId, language);
        }

        return this.update(
            { discordId: userId },
            {
                $set: {
                    locale: language,
                },
            },
            { upsert: true }
        );
    }
}
