import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { GuildSettings } from "@alice-database/utils/aliceDb/GuildSettings";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseGuildSettings } from "@alice-interfaces/database/aliceDb/DatabaseGuildSettings";
import { GuildChannelSettings } from "@alice-interfaces/moderation/GuildChannelSettings";
import { Language } from "@alice-localization/base/Language";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `guildsettings` collection.
 */
export class GuildSettingsCollectionManager extends DatabaseCollectionManager<
    DatabaseGuildSettings,
    GuildSettings
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseGuildSettings,
        GuildSettings
    >;

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
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseGuildSettings>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseGuildSettings, GuildSettings>
            >new GuildSettings().constructor;
    }

    /**
     * Gets the settings of a guild.
     *
     * @param guildId The ID of the guild.
     * @returns The guild setting, `null` if not found.
     */
    getGuildSetting(guildId: Snowflake): Promise<GuildSettings | null> {
        return this.getOne({ id: guildId });
    }

    /**
     * Gets the settings of a guild with a channel.
     *
     * @param channelId The ID of the channel.
     * @returns The guild setting, `null` if not found.
     */
    getGuildSettingWithChannel(channelId: Snowflake): Promise<GuildSettings | null> {
        return this.getOne({ "channelSettings.id": channelId });
    }

    /**
     * Sets a server's preferred locale.
     * 
     * @param guildId The ID of the guild.
     * @param language The language to set the preferred locale to.
     * @returns An object containing information about the operation.
     */
    async setServerLocale(guildId: Snowflake, language: Language): Promise<OperationResult> {
        let guildSetting: GuildSettings | null = await this.getGuildSetting(guildId);

        if (!guildSetting) {
            guildSetting = this.defaultInstance;
            guildSetting.id = guildId;
        }

        guildSetting.preferredLocale = language;

        return guildSetting.updateData();
    }

    /**
     * Sets a channel's preferred locale.
     * 
     * @param guildId The ID of the guild the channel is in.
     * @param channelId The ID of the channel.
     * @param language The language to set the preferred locale to.
     * @returns An object containing information about the operation.
     */
    async setChannelLocale(guildId: Snowflake, channelId: Snowflake, language: Language): Promise<OperationResult> {
        let guildSetting: GuildSettings | null = await this.getGuildSetting(guildId);

        if (!guildSetting) {
            guildSetting = this.defaultInstance;
            guildSetting.id = guildId;
        }

        const channelSetting: GuildChannelSettings = guildSetting.channelSettings.get(channelId) ?? {
            id: channelId,
            disabledCommands: [],
            disabledEventUtils: []
        };

        if (channelSetting.preferredLocale === language) {
            // Don't need to make a call to database
            return this.createOperationResult(true);
        }

        channelSetting.preferredLocale = language;

        guildSetting.channelSettings.set(channelId, channelSetting);

        return guildSetting.updateData();
    }
}
