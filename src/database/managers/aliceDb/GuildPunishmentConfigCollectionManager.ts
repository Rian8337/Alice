import { DatabaseCollectionManager } from "@database/managers/DatabaseCollectionManager";
import { GuildPunishmentConfig } from "@database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseGuildPunishmentConfig } from "structures/database/aliceDb/DatabaseGuildPunishmentConfig";
import { OperationResult } from "structures/core/OperationResult";
import { Guild, Snowflake } from "discord.js";

/**
 * A manager for the `punishmentconfig` collection.
 */
export class GuildPunishmentConfigCollectionManager extends DatabaseCollectionManager<
    DatabaseGuildPunishmentConfig,
    GuildPunishmentConfig
> {
    protected override readonly utilityInstance: new (
        data: DatabaseGuildPunishmentConfig,
    ) => GuildPunishmentConfig = GuildPunishmentConfig;

    override get defaultDocument(): DatabaseGuildPunishmentConfig {
        return {
            allowedTimeoutRoles: [],
            guildID: "",
            immuneTimeoutRoles: [],
            logChannel: "",
        };
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
    getGuildConfig(
        guildOrGuildId: Snowflake | Guild,
    ): Promise<GuildPunishmentConfig | null> {
        return this.getOne({
            guildID:
                guildOrGuildId instanceof Guild
                    ? guildOrGuildId.id
                    : guildOrGuildId,
        });
    }

    /**
     * Sets a guild's punishment log channel.
     *
     * @param guildId The ID of the guild.
     * @param channelId The ID of the channel.
     * @returns An object containing information about the database operation.
     */
    setGuildLogChannel(
        guildId: Snowflake,
        channelId: Snowflake,
    ): Promise<OperationResult> {
        return this.updateOne(
            { guildID: guildId },
            {
                $set: {
                    logChannel: channelId,
                },
                $setOnInsert: {
                    allowedTimeoutRoles: [],
                    immuneTimeoutRoles: [],
                },
            },
            { upsert: true },
        );
    }

    /**
     * Unsets a guild's punishment log channel.
     *
     * @param guildId The ID of the guild.
     * @returns An object containing information about the database operation.
     */
    unsetGuildLogChannel(guildId: Snowflake): Promise<OperationResult> {
        return this.updateOne(
            { guildID: guildId },
            {
                $unset: {
                    logChannel: "",
                },
            },
        );
    }
}
