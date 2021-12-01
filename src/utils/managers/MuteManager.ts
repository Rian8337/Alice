import {
    Collection,
    CommandInteraction,
    Guild,
    GuildChannel,
    GuildMember,
    Message,
    MessageEmbed,
    Permissions,
    Role,
    Snowflake,
    TextChannel,
    ThreadChannel,
    VoiceChannel,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Mute } from "@alice-interfaces/moderation/Mute";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { RoleMutePermission } from "@alice-interfaces/moderation/RoleMutePermission";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PunishmentManager } from "./PunishmentManager";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { LoungeLockManager } from "./LoungeLockManager";
import { Config } from "@alice-core/Config";

/**
 * A manager for mutes.
 */
export abstract class MuteManager extends PunishmentManager {
    /**
     * The role name of this bot's mute role.
     */
    private static readonly muteRoleName: string = "elaina-muted";

    /**
     * The temporary mutes that are still active, mapped by the user's ID.
     */
    private static readonly currentMutes: Collection<
        Snowflake,
        NodeJS.Timeout
    > = new Collection();

    /**
     * Initializes the manager.
     *
     * This will:
     * - Continue temporary mutes upon bot restart
     * - Remove temporary mutes that have expired (if it's not already taken off)
     * - Reapply mutes that were manually taken off
     */
    static override async init(): Promise<void> {
        this.punishmentDb =
            DatabaseManager.aliceDb.collections.guildPunishmentConfig;

        if (!Config.isDebug) {
            await this.cacheOngoingMute();
        }
    }

    /**
     * Adds a mute, be it temporary or permanent.
     *
     * The user will be given the mute role if they have not been muted yet.
     *
     * If the role has not been created yet, it will be created and applied
     * to every channel automatically.
     *
     * This will also send a log to the guild's log channel.
     *
     * @param interaction The interaction that triggered the mute.
     * @param member The guild member to mute.
     * @param reason Reason for muting.
     * @param duration The duration to mute the user for, in seconds. For permanent mutes, use Infinity.
     * @returns An object containing information about the operation.
     */
    static async addMute(
        interaction: CommandInteraction,
        member: GuildMember,
        reason: string,
        duration: number
    ): Promise<OperationResult> {
        if (await this.userIsImmune(member)) {
            return this.createOperationResult(false, "User has mute immunity");
        }

        if (isNaN(duration)) {
            return this.createOperationResult(false, "Invalid mute duration");
        }

        if (duration < 30) {
            return this.createOperationResult(
                false,
                "Minimum mute duration is 30 seconds"
            );
        }

        const isInfiniteMute: boolean = !Number.isFinite(duration);

        if (
            !(await this.userCanMute(<GuildMember>interaction.member, duration))
        ) {
            return this.createOperationResult(
                false,
                `Not enough permission to mute ${
                    isInfiniteMute
                        ? "permanently"
                        : `for ${DateTimeFormatHelper.secondsToDHMS(duration)}`
                }`
            );
        }

        if (!reason) {
            return this.createOperationResult(false, "No mute reason provided");
        }

        if (reason.length > 1500) {
            return this.createOperationResult(
                false,
                "Mute reason is too long; maximum is 1500 characters"
            );
        }

        // Check if there are duplicate mutes
        if (this.currentMutes.has(member.id)) {
            return this.createOperationResult(false, "User is already muted");
        }

        let muteRole: Role | undefined = this.getGuildMuteRole(member.guild);

        if (!muteRole) {
            // Create mute role if it doesn't exist yet
            muteRole = await member.guild.roles.create({
                name: "elaina-muted",
                color: "#000000",
                permissions: [],
            });

            if (!muteRole) {
                return this.createOperationResult(
                    false,
                    "Unable to create mute role"
                );
            }
        }

        // Update mute role permission for each text channel
        await member.guild.channels.fetch();

        member.guild.channels.cache.forEach(async (channel) => {
            if (
                channel instanceof TextChannel ||
                channel instanceof VoiceChannel
            ) {
                await channel.permissionOverwrites.edit(muteRole!, {
                    SEND_MESSAGES: false,
                    SEND_MESSAGES_IN_THREADS: false,
                    ADD_REACTIONS: false,
                    SPEAK: false,
                    CONNECT: false,
                });
            }
        });

        // Check if the user is already muted via role
        if (this.isUserMuted(member)) {
            return this.createOperationResult(
                false,
                "The user is already muted"
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await this.punishmentDb.getGuildConfig(member.guild);

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(
            member.guild
        );

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

        await member.roles.add(muteRole);

        if (member.voice.channel) {
            member.voice.disconnect("User is muted");
        }

        const muteEmbed: MessageEmbed = new MessageEmbed()
            .setAuthor(
                interaction.user.tag,
                interaction.user.avatarURL({ dynamic: true })!
            )
            .setTitle("Mute executed")
            .setFooter(
                `User ID: ${member.id} | Channel ID: ${interaction.channel?.id}`
            )
            .setTimestamp(new Date())
            .setDescription(
                `**${member} in ${interaction.channel} ${
                    isInfiniteMute
                        ? "permanently"
                        : `for ${DateTimeFormatHelper.secondsToDHMS(duration)}`
                }**\n\n` +
                    `=========================\n\n` +
                    `**Reason**:\n` +
                    reason
            );

        const durationString: string = isInfiniteMute
            ? "permanently"
            : `for \`${DateTimeFormatHelper.secondsToDHMS(duration)}\``;

        try {
            await this.notifyMember(
                member,
                `Hey, you were muted ${durationString} for \`${reason}\`. Sorry!`,
                muteEmbed
            );
        } catch {
            interaction.channel!.send(
                MessageCreator.createWarn(
                    `A user has been muted, but their DMs are locked. The user will be muted ${durationString}.`
                )
            );
        }

        const msg: Message = await logChannel.send({ embeds: [muteEmbed] });

        const muteInformation: Mute = {
            userID: member.id,
            logChannelID: logChannel.id,
            logMessageID: msg.id,
            muteEndTime: Math.floor(Date.now() / 1000) + duration,
        };

        await this.punishmentDb.update(
            { guildID: member.guild.id },
            { $addToSet: { currentMutes: muteInformation } }
        );

        if (duration >= 6 * 3600) {
            await LoungeLockManager.lock(
                member.id,
                "Muted for 6 hours or longer",
                30 * 24 * 3600
            );
        }

        if (!isInfiniteMute) {
            const timeout: NodeJS.Timeout = setTimeout(async () => {
                await this.removeMute(member);
            }, duration * 1000);

            this.currentMutes.set(member.id, timeout);
        }

        return this.createOperationResult(true);
    }

    /**
     * Removes a mute.
     *
     * The user's mute role will be taken if it hasn't been done yet.
     *
     * @param member The guild member to unmute.
     * @param interaction The interaction that triggered the unmute, if any.
     * @param reason The reason for unmuting, if this unmute is triggered by an interaction.
     * @returns An object containing information about the operation.
     */
    static async removeMute(
        member: GuildMember,
        interaction?: CommandInteraction,
        reason?: string
    ): Promise<OperationResult> {
        const muteInformation: Mute | undefined = await this.getMuteInformation(
            member
        );

        if (!muteInformation) {
            return this.createOperationResult(
                false,
                "Could not find mute information"
            );
        }

        if (
            !this.currentMutes.has(member.id) &&
            muteInformation.muteEndTime !== Number.POSITIVE_INFINITY
        ) {
            return this.createOperationResult(false, "Unable to find mute");
        }

        const muteRole: Role | undefined = this.getGuildMuteRole(member.guild);

        if (!muteRole) {
            return this.createOperationResult(
                false,
                "Unable to find mute role in the server"
            );
        }

        if (!this.isUserMuted(member)) {
            return this.createOperationResult(false, "The user is not muted");
        }

        const logChannel: GuildChannel | ThreadChannel | null =
            member.guild.channels.resolve(muteInformation.logChannelID);

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

        const logMessage: Message = await logChannel.messages.fetch(
            muteInformation.logMessageID
        );
        if (!logMessage) {
            return this.createOperationResult(
                false,
                "Unable to find log message"
            );
        }

        if (reason && interaction) {
            if (reason.length > 1500) {
                return this.createOperationResult(
                    false,
                    "Unmute reason is too long; maximum is 1500 characters"
                );
            }

            // Get current log channel
            const guildConfig: GuildPunishmentConfig | null =
                await this.punishmentDb.getGuildConfig(member.guild);

            if (!guildConfig) {
                return this.createOperationResult(
                    false,
                    this.logChannelNotFoundReject
                );
            }

            const currentLogChannel: GuildChannel | null =
                guildConfig.getGuildLogChannel(member.guild);

            if (!currentLogChannel) {
                return this.createOperationResult(
                    false,
                    "Unable to find server log channel"
                );
            }

            if (!(currentLogChannel instanceof TextChannel)) {
                return this.createOperationResult(
                    false,
                    "The server's log channel is not a text channel"
                );
            }

            const unmuteEmbed: MessageEmbed = new MessageEmbed()
                .setAuthor(
                    interaction.user.tag,
                    <string>interaction.user.avatarURL({ dynamic: true })
                )
                .setTitle("Unmute executed")
                .setFooter(
                    `User ID: ${member.id} | Channel ID: ${interaction.channel?.id}`
                )
                .setTimestamp(new Date())
                .setDescription(
                    `**${member} in ${interaction.channel}**\n\n` +
                        `=========================\n\n` +
                        `**Reason**:\n` +
                        reason
                );

            currentLogChannel.send({ embeds: [unmuteEmbed] });

            await this.notifyMember(
                member,
                `Hey, you were unmuted for ${reason}.`,
                unmuteEmbed
            );
        }

        this.currentMutes.delete(member.id);

        await this.punishmentDb.update(
            { guildID: member.guild.id },
            { $pull: { currentMutes: { userID: member.id } } }
        );

        await member.roles.remove(muteRole, reason ?? "Mute time is over");

        const muteEmbed: MessageEmbed = logMessage.embeds[0];

        muteEmbed.setFooter(
            muteEmbed.footer?.text + " | User unmuted",
            muteEmbed.footer?.iconURL
        );

        if (logMessage.editable) {
            await logMessage.edit({ embeds: [muteEmbed] });
        }

        return this.createOperationResult(true);
    }

    /**
     * Checks if a guild member can mute a user with specified duration.
     *
     * @param member The guild member executing the mute.
     * @param duration The duration the guild member wants to mute for, in seconds.
     * @returns A boolean indicating whether the guild member can mute the user.
     */
    static async userCanMute(
        member: GuildMember,
        duration: number
    ): Promise<boolean> {
        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                member.guild
            );

        if (!guildConfig) {
            return false;
        }

        const allowedMuteRoles: Collection<Snowflake, RoleMutePermission> =
            guildConfig.allowedMuteRoles;

        let maxDuration: number = Number.NEGATIVE_INFINITY;

        for await (const allowedMuteRole of allowedMuteRoles.values()) {
            if (!member.roles.cache.has(allowedMuteRole.id)) {
                continue;
            }

            if (allowedMuteRole.maxTime < 0) {
                return true;
            }

            maxDuration = Math.max(maxDuration, allowedMuteRole.maxTime);

            // End loop here if duration is fulfilled
            if (duration <= maxDuration) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if a guild member is immune.
     *
     * @param member The guild member to check.
     * @returns A boolean indicating whether the guild member is immune.
     */
    static async userIsImmune(member: GuildMember): Promise<boolean> {
        if (
            member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
            member.user.bot
        ) {
            return true;
        }

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                member.guild
            );

        if (!guildConfig) {
            return false;
        }

        return member.roles.cache.hasAny(...guildConfig.immuneMuteRoles);
    }

    /**
     * Gets the mute role of a guild.
     *
     * @param guild The guild to get the mute role from.
     * @returns The mute role, `undefined` if not found.
     */
    static getGuildMuteRole(guild: Guild): Role | undefined {
        return guild.roles.cache.find((r) => r.name === this.muteRoleName);
    }

    /**
     * Gets a guild member's mute log.
     *
     * @param member The guild member to get the mute log from.
     * @returns The mute log of the guild member.
     */
    static async getMuteInformation(
        member: GuildMember
    ): Promise<Mute | undefined> {
        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                member.guild
            );

        if (!guildConfig) {
            return undefined;
        }

        return guildConfig.currentMutes.get(member.id);
    }

    /**
     * Checks if a guild member is muted.
     *
     * @param member The member.
     * @returns Whether the guild member is muted.
     */
    static isUserMuted(member: GuildMember): boolean {
        const muteRole: Role | undefined = this.getGuildMuteRole(member.guild);

        if (!muteRole) {
            return false;
        }

        return member.roles.cache.has(muteRole.id);
    }

    /**
     * Continues a mute.
     *
     * @param client The instance of the bot.
     * @param member The guild member to mute.
     * @param muteInformation Additional information about the mute.
     */
    static async continueMute(
        member: GuildMember,
        muteInformation: Mute
    ): Promise<void> {
        const muteRole: Role | undefined = this.getGuildMuteRole(member.guild);

        if (!muteRole) {
            return;
        }

        if (!this.isUserMuted(member)) {
            await member.roles.add(muteRole, "Mute continuation");
        }

        const durationLeft: number = DateTimeFormatHelper.getTimeDifference(
            muteInformation.muteEndTime * 1000
        );

        if (!Number.isFinite(durationLeft)) {
            return;
        }

        if (durationLeft <= 0) {
            await this.removeMute(member);
            return;
        }

        if (!this.currentMutes.has(member.id)) {
            const timeout: NodeJS.Timeout = setTimeout(async () => {
                await this.removeMute(member);
            }, Math.max(5000, durationLeft));

            this.currentMutes.set(member.id, timeout);
        }
    }

    /**
     * Caches ongoing mutes upon bot startup to continue mute tracking.
     *
     * @param client The instance of the bot.
     */
    private static async cacheOngoingMute(): Promise<void> {
        const muteEntries: Collection<string, GuildPunishmentConfig> =
            await this.punishmentDb.get(
                "guildID",
                {},
                { projection: { guildID: 1, currentMutes: 1 } }
            );

        for await (const entry of muteEntries.values()) {
            const guild: Guild | null = await this.client.guilds
                .fetch(entry.guildID)
                .catch(() => null);

            if (!guild) {
                continue;
            }

            const muteRole: Role | undefined = this.getGuildMuteRole(guild);

            if (!muteRole) {
                continue;
            }

            for await (const mute of entry.currentMutes.values()) {
                const guildMember: GuildMember | null = await guild.members
                    .fetch(mute.userID)
                    .catch(() => null);

                if (!guildMember) {
                    continue;
                }

                await this.continueMute(guildMember, mute);
            }
        }
    }

    /**
     * Notifies a guild member about their mute status.
     *
     * @param client The instance of the bot.
     * @param member The member to notify.
     * @param content The content of the notification.
     * @param embed The embed for notification.
     */
    private static async notifyMember(
        member: GuildMember,
        content: string,
        embed: MessageEmbed
    ): Promise<void> {
        await member.send({
            content: MessageCreator.createWarn(content),
            embeds: [embed],
        });
    }
}
