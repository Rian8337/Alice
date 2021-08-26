import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseGuildPunishmentConfig } from "@alice-interfaces/database/aliceDb/DatabaseGuildPunishmentConfig";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Guild, Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `punishmentconfig` collection.
 */
export class GuildPunishmentConfigCollectionManager extends DatabaseCollectionManager<DatabaseGuildPunishmentConfig, GuildPunishmentConfig> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseGuildPunishmentConfig, GuildPunishmentConfig>;

    get defaultDocument(): DatabaseGuildPunishmentConfig {
        return {
            allowedMuteRoles: [],
            currentMutes: [],
            guildID: "",
            immuneMuteRoles: [],
            logChannel: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseGuildPunishmentConfig>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseGuildPunishmentConfig, GuildPunishmentConfig>> new GuildPunishmentConfig(client, this.defaultDocument).constructor
    }

    /**
     * Gets a guild's punishment configuration.
     * 
     * @param guild The guild to get the punishment configuration from.
     * @returns The guild's punishment configuration. `null` if the configuration is not found.
     */
    getGuildConfig(guild: Guild): Promise<GuildPunishmentConfig | null>;

    /**
     * Gets a guild's punishment configuration.
     * 
     * @param guildId The ID of the guild to get the punishment configuration from.
     * @returns The guild's punishment configuration. `null` if the configuration is not found.
     */
    getGuildConfig(guildId: Snowflake): Promise<GuildPunishmentConfig | null>;

    /**
     * Gets a guild's punishment configuration.
     * 
     * @param guildOrGuildId The guild to get the punishment configuration from or its ID.
     * @returns The guild's punishment configuration. `null` if the configuration is not found.
     */
    getGuildConfig(guildOrGuildId: Snowflake | Guild): Promise<GuildPunishmentConfig | null> {
        return this.getOne({ guildID: guildOrGuildId instanceof Guild ? guildOrGuildId.id : guildOrGuildId });
    }

    /**
     * Sets a guild's punishment log channel.
     * 
     * @param guildId The ID of the guild.
     * @param channelId The ID of the channel.
     * @returns An object containing information about the database operation.
     */
    setGuildLogChannel(guildId: Snowflake, channelId: Snowflake): Promise<DatabaseOperationResult> {
        return this.update(
            { guildID: guildId },
            {
                $set: {
                    logChannel: channelId
                },
                $setOnInsert: {
                    allowedMuteRoles: [],
                    immuneMuteRoles: []
                }
            },
            { upsert: true }
        );
    }

    /**
     * Unsets a guild's punishment log channel.
     * 
     * @param guildId The ID of the guild.
     * @returns An object containing information about the database operation.
     */
    unsetGuildLogChannel(guildId: Snowflake): Promise<DatabaseOperationResult> {
        return this.update(
            { guildID: guildId },
            {
                $unset: {
                    logChannel: ""
                }
            }
        );
    }
}