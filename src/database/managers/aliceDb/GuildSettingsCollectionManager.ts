import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { GuildSettings } from "@alice-database/utils/aliceDb/GuildSettings";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseGuildSettings } from "@alice-interfaces/database/aliceDb/DatabaseGuildSettings";
import { GuildChannelSettings } from "@alice-interfaces/moderation/GuildChannelSettings";
import { Language } from "@alice-localization/base/Language";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { Snowflake } from "discord.js";
import { FindOptions } from "mongodb";

/**
 * A manager for the `guildsettings` collection.
 */
export class GuildSettingsCollectionManager extends DatabaseCollectionManager<
    DatabaseGuildSettings,
    GuildSettings
> {
    protected override readonly utilityInstance: new (
        data: DatabaseGuildSettings
    ) => GuildSettings = GuildSettings;

    override get defaultDocument(): DatabaseGuildSettings {
        return {
            channelSettings: [],
            disabledCommands: [],
            disabledEventUtils: [],
            id: "",
            preferredLocale: "en",
        };
    }

    /**
     * Gets the settings of a guild.
     *
     * @param guildId The ID of the guild.
     * @param options Options for the retrieval of the guild settings.
     * @returns The guild setting, `null` if not found.
     */
    getGuildSetting(
        guildId: Snowflake,
        options?: FindOptions<DatabaseGuildSettings>
    ): Promise<GuildSettings | null> {
        return this.getOne({ id: guildId }, this.processFindOptions(options));
    }

    /**
     * Gets the settings of a guild with a channel.
     *
     * @param channelId The ID of the channel.
     * @param options Options for the retrieval of the guild settings.
     * @returns The guild setting, `null` if not found.
     */
    getGuildSettingWithChannel(
        channelId: Snowflake,
        options?: FindOptions<DatabaseGuildSettings>
    ): Promise<GuildSettings | null> {
        return this.getOne(
            { "channelSettings.id": channelId },
            this.processFindOptions(options)
        );
    }

    /**
     * Sets a server's preferred locale.
     *
     * @param guildId The ID of the guild.
     * @param language The language to set the preferred locale to.
     * @returns An object containing information about the operation.
     */
    async setServerLocale(
        guildId: Snowflake,
        language: Language
    ): Promise<OperationResult> {
        const guildSetting: GuildSettings | null = await this.getGuildSetting(
            guildId,
            {
                projection: {
                    _id: 0,
                    preferredLocale: 1,
                },
            }
        );

        if (!guildSetting) {
            if (language === "en") {
                return this.createOperationResult(true);
            }

            return DatabaseManager.aliceDb.collections.guildSettings.insert({
                id: guildId,
                preferredLocale: language,
            });
        }

        if (guildSetting.preferredLocale === language) {
            return this.createOperationResult(true);
        }

        return DatabaseManager.aliceDb.collections.guildSettings.updateOne(
            { id: guildId },
            {
                $set: {
                    preferredLocale: language,
                },
            }
        );
    }

    /**
     * Sets a channel's preferred locale.
     *
     * @param guildId The ID of the guild the channel is in.
     * @param channelId The ID of the channel.
     * @param language The language to set the preferred locale to.
     * @returns An object containing information about the operation.
     */
    async setChannelLocale(
        guildId: Snowflake,
        channelId: Snowflake,
        language: Language
    ): Promise<OperationResult> {
        const guildSetting: GuildSettings | null = await this.getGuildSetting(
            guildId,
            {
                projection: {
                    _id: 0,
                    channelSettings: 1,
                },
            }
        );

        if (!guildSetting) {
            if (language === "en") {
                return this.createOperationResult(true);
            }

            return DatabaseManager.aliceDb.collections.guildSettings.insert({
                id: guildId,
                channelSettings: [
                    {
                        id: channelId,
                        disabledCommands: [],
                        disabledEventUtils: [],
                        preferredLocale: language,
                    },
                ],
            });
        }

        const channelSetting: GuildChannelSettings | undefined =
            guildSetting.channelSettings.get(channelId);

        if (!channelSetting) {
            if (language === "en") {
                return this.createOperationResult(true);
            }

            return DatabaseManager.aliceDb.collections.guildSettings.updateOne(
                { id: guildId },
                {
                    $push: {
                        channelSettings: {
                            id: channelId,
                            disabledCommands: [],
                            disabledEventUtils: [],
                            preferredLocale: language,
                        },
                    },
                }
            );
        }

        if (channelSetting.preferredLocale === language) {
            // Don't need to make a call to database
            return this.createOperationResult(true);
        }

        channelSetting.preferredLocale = language;

        guildSetting.channelSettings.set(channelId, channelSetting);

        if (CacheManager.channelLocale.has(channelId)) {
            CacheManager.channelLocale.set(channelId, language);
        }

        return DatabaseManager.aliceDb.collections.guildSettings.updateOne(
            { id: guildId },
            {
                $set: {
                    "channelSettings.$[channelFilter].preferredLocale":
                        language,
                },
            },
            {
                arrayFilters: [{ "channelFilter.id": channelId }],
            }
        );
    }

    protected override processFindOptions(
        options?: FindOptions<DatabaseGuildSettings>
    ): FindOptions<DatabaseGuildSettings> | undefined {
        if (options?.projection) {
            options.projection.id = 1;
        }

        return options;
    }
}
