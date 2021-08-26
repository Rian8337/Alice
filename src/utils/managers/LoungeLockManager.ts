import { Guild, GuildChannel, MessageEmbed, Snowflake, TextChannel } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { LoungeLockOperationResult } from "@alice-interfaces/moderation/LoungeLockOperationResult";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { PunishmentManager } from "./PunishmentManager";
import { LoungeLockCollectionManager } from "@alice-database/managers/aliceDb/LoungeLockCollectionManager";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";

/**
 * A manager for lounge locks.
 */
export abstract class LoungeLockManager extends PunishmentManager {
    /**
     * The server the channel is located in.
     */
    private static mainServer: Guild;

    /**
     * The database collection that is responsible for storing lounge lock data.
     */
    private static loungeLockDb: LoungeLockCollectionManager;

    /**
     * Initializes the manager.
     * 
     * @param client The instance of the bot.
     */
    static async init(): Promise<void> {
        this.loungeLockDb = DatabaseManager.aliceDb.collections.loungeLock;

        this.mainServer = await this.client.guilds.fetch(Constants.mainServer);
    }

    /**
     * Locks a user from lounge or extends its duration.
     * 
     * @param userID The ID of the user.
     * @param reason The reason for locking the user.
     * @param duration The duration of the lock or the extension. For permanent locks, use `Number.POSITIVE_INFINITY` or -1.
     * @returns An object containing information about the operation.
     */
    static async lock(userID: Snowflake, reason: string, duration: number): Promise<LoungeLockOperationResult> {
        if (duration < 0) {
            duration = Number.POSITIVE_INFINITY;
        }

        const lockInfo: LoungeLock | null = await this.loungeLockDb.getUserLockInfo(userID);

        const guildConfig: GuildPunishmentConfig | null = await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(this.mainServer);

        if (!guildConfig) {
            return this.createOperationResult(false, this.logChannelNotFoundReject);
        }

        const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(this.mainServer);

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(false, this.logChannelNotValidReject);
        }

        const logEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({ timestamp: true });

        if (lockInfo) {
            // Extend lock and update reason
            await lockInfo.extend(duration, reason);

            logEmbed.setColor("#c7c03c")
                .setTitle("Lounge Lock Extended")
                .setDescription(
                    `**User**: <@${userID}>
                    **Updated Reason**: ${reason}
                    **New Expiration Date**: ${!Number.isFinite(lockInfo.expiration + duration) ? "Never" : new Date((lockInfo.expiration + duration) * 1000).toUTCString()}`
                );
        } else {
            // Insert new lock
            await this.loungeLockDb.insertNewLock(userID, duration, reason);

            logEmbed.setColor("#a5de6f")
                .setTitle("Lounge Lock Added")
                .setDescription(
                    `**User**: <@${userID}>
                    **Updated Reason**: ${reason}
                    **Expiration Date**: ${new Date(duration * 1000).toUTCString()}`
                );
        }

        await logChannel.send({ embeds: [logEmbed] });

        return this.createOperationResult(true);
    }

    /**
     * Unlocks a user from lounge.
     * 
     * @param userID The ID of the user.
     * @param reason The reason for unlocking the user.
     * @returns An object containing information about the operation.
     */
    static async unlock(userID: Snowflake, reason: string): Promise<LoungeLockOperationResult> {
        const lockInfo: LoungeLock | null = await this.loungeLockDb.getUserLockInfo(userID);

        if (!lockInfo) {
            return this.createOperationResult(false, "User is not locked from lounge");
        }

        const guildConfig: GuildPunishmentConfig | null = await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(this.mainServer);

        if (!guildConfig) {
            return this.createOperationResult(false, this.logChannelNotFoundReject);
        }

        const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(this.mainServer);

        if (!logChannel) {
            return this.createOperationResult(false, this.logChannelNotFoundReject);
        }

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(false, this.logChannelNotValidReject);
        }

        const logEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({ timestamp: true });

        logEmbed.setColor("#3ba7b8")
            .setTitle("Lounge Lock Removed")
            .setDescription(
                `**User**: <@${userID}>
                **Updated Reason**: ${reason}`
            );

        await lockInfo.unlock();

        await logChannel.send({ embeds: [logEmbed] });

        return this.createOperationResult(true);
    }
}