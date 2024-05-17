import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Language } from "@alice-localization/base/Language";
import { CacheManager } from "@alice-utils/managers/CacheManager";

/**
 * A helper class for locales.
 */
export abstract class LocaleHelper {
    /**
     * Loads all locales from the database to cache.
     */
    static async loadLocales() {
        const guildSettings =
            await DatabaseManager.aliceDb.collections.guildSettings.get(
                "id",
                {},
                {
                    projection: {
                        _id: 0,
                        preferredLocale: 1,
                        "channelSettings.id": 1,
                        "channelSettings.preferredLocale": 1,
                    },
                },
            );

        for (const guildSetting of guildSettings.values()) {
            CacheManager.guildLocale.set(
                guildSetting.id,
                guildSetting.preferredLocale,
            );

            for (const channelSetting of guildSetting.channelSettings.values()) {
                if (channelSetting.preferredLocale !== undefined) {
                    CacheManager.channelLocale.set(
                        channelSetting.id,
                        channelSetting.preferredLocale ?? "en",
                    );
                }
            }
        }

        const userLocales =
            await DatabaseManager.aliceDb.collections.userLocale.get(
                "discordId",
            );

        for (const userLocale of userLocales.values()) {
            CacheManager.userLocale.set(
                userLocale.discordId,
                userLocale.locale,
            );
        }
    }

    /**
     * Converts a language into a BCP 47 language tag.
     *
     * @param language The language to convert.
     */
    static convertToBCP47(language: Language): string {
        switch (language) {
            case "kr":
                return "ko-KR";
            case "id":
                return "id-ID";
            case "es":
                return "es-ES";
            default:
                return "en-US";
        }
    }
}
