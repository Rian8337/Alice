import {
    Guild,
    GuildChannel,
    MessageEmbed,
    Snowflake,
    TextChannel,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
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
     * The lounge channel of the main server.
     */
    static loungeChannel: TextChannel;

    /**
     * Initializes the manager.
     *
     * @param client The instance of the bot.
     */
    static override async init(): Promise<void> {
        this.loungeLockDb = DatabaseManager.aliceDb.collections.loungeLock;

        this.mainServer = await this.client.guilds.fetch(Constants.mainServer);

        this.loungeChannel = <TextChannel>(
            await this.mainServer.channels.fetch(Constants.loungeChannel)
        );
    }

    /**
     * Locks a user from lounge or extends its duration.
     *
     * @param userId The ID of the user.
     * @param reason The reason for locking the user.
     * @param duration The duration of the lock or the extension, in seconds. For permanent locks, use `Number.POSITIVE_INFINITY` or -1.
     * @param updateChannelPermission Whether to update lounge channel permission. Defaults to `true`.
     * @returns An object containing information about the operation.
     */
    static async lock(
        userId: Snowflake,
        reason: string,
        duration: number,
        updateChannelPermission: boolean = true
    ): Promise<OperationResult> {
        if (duration < 0) {
            duration = Number.POSITIVE_INFINITY;
        }

        const lockInfo: LoungeLock | null =
            await this.loungeLockDb.getUserLockInfo(userId);

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                this.mainServer
            );

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null =
            await guildConfig.getGuildLogChannel(this.mainServer);

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(
                false,
                this.logChannelNotValidReject
            );
        }

        const logEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
            timestamp: true,
        });

        if (lockInfo) {
            // Extend lock and update reason
            await lockInfo.extend(duration, reason);

            logEmbed
                .setColor("#c7c03c")
                .setTitle("Lounge Lock Extended")
                .setDescription(
                    `**User**: <@${userId}>\n` +
                    `**Updated Reason**: ${reason}\n` +
                    `**New Expiration Date**: ${!Number.isFinite(
                        lockInfo.expiration + duration * 1000
                    )
                        ? "Never"
                        : new Date(
                            lockInfo.expiration + duration * 1000
                        ).toUTCString()
                    }`
                );
        } else {
            // Insert new lock
            await this.loungeLockDb.insertNewLock(userId, duration, reason);

            if (updateChannelPermission) {
                await this.insertLockPermissionToChannel(userId);
            }

            logEmbed
                .setColor("#a5de6f")
                .setTitle("Lounge Lock Added")
                .setDescription(
                    `**User**: <@${userId}>\n` +
                    `**Reason**: ${reason}\n` +
                    `**Expiration Date**: ${!Number.isFinite(duration * 1000)
                        ? "Never"
                        : new Date(
                            Date.now() + duration * 1000
                        ).toUTCString()
                    }`
                );
        }

        await logChannel.send({ embeds: [logEmbed] });

        return this.createOperationResult(true);
    }

    /**
     * Unlocks a user from lounge.
     *
     * @param userId The ID of the user.
     * @param reason The reason for unlocking the user.
     * @returns An object containing information about the operation.
     */
    static async unlock(
        userId: Snowflake,
        reason: string
    ): Promise<OperationResult> {
        const lockInfo: LoungeLock | null =
            await this.loungeLockDb.getUserLockInfo(userId);

        if (!lockInfo) {
            return this.createOperationResult(
                false,
                "User is not locked from lounge"
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                this.mainServer
            );

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null =
            await guildConfig.getGuildLogChannel(this.mainServer);

        if (!logChannel) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(
                false,
                this.logChannelNotValidReject
            );
        }

        const logEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
            timestamp: true,
        });

        logEmbed
            .setColor("#3ba7b8")
            .setTitle("Lounge Lock Removed")
            .setDescription(
                `**User**: <@${userId}>
                **Reason**: ${reason}`
            );

        await lockInfo.unlock();

        await logChannel.send({ embeds: [logEmbed] });

        return this.createOperationResult(true);
    }

    /**
     * Inserts a lock permission to the lounge channel.
     *
     * @param userId The ID of the user to lock.
     */
    static async insertLockPermissionToChannel(
        userId: Snowflake
    ): Promise<void> {
        return this.updateChannelPermission(userId, true);
    }

    /**
     * Removes a lock permission to the lounge channel.
     *
     * @param userId The ID of the user to remove.
     */
    static async removeLockPermissionFromChannel(
        userId: Snowflake
    ): Promise<void> {
        return this.updateChannelPermission(userId, false);
    }

    /**
     * Updates the lounge channel's permission with respect to a user.
     *
     * @param userId The ID of the user.
     * @param lock Whether to lock the user.
     */
    private static async updateChannelPermission(
        userId: Snowflake,
        lock: boolean
    ): Promise<void> {
        await this.loungeChannel.permissionOverwrites.edit(
            userId,
            { VIEW_CHANNEL: !lock },
            { reason: lock ? "Lounge lock insertion" : "Lounge lock removal" }
        );
    }
}
