import { GuildMember, MessageEmbed, Permissions, TextChannel, User } from "discord.js";
import { Config } from "@alice-core/Config";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { reportStrings } from "./reportStrings";

export const run: Command["run"] = async (_, interaction) => {
    if (!interaction.inGuild() || interaction.guildId !== Constants.mainServer) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.notAvailableInServerReject)
        });
    }

    const toReport: GuildMember | void = await interaction.guild!.members.fetch(interaction.options.getUser("user", true)).catch(() => {});

    if (!toReport) {
        return interaction.editReply({
            content: MessageCreator.createReject(reportStrings.userToReportNotFound)
        });
    }

    if (toReport.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return interaction.editReply({
            content: MessageCreator.createReject(reportStrings.userNotReportable)
        });
    }

    if (toReport.id === interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(reportStrings.selfReportError)
        });
    }

    const reason: string = interaction.options.getString("reason")!;

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember> interaction.member).displayColor, timestamp: true }
    );

    embed.setThumbnail(toReport.user.avatarURL({ dynamic: true })!)
        .setDescription(
            `**Offender**: ${toReport} (${toReport.id})
            **Channel**: ${interaction.channel}
            **Reason**: ${reason}`
        );

    const reportChannel: TextChannel = <TextChannel> interaction.guild!.channels.cache.find(c => c.name === Config.reportChannel);

    reportChannel.send({ embeds: [embed] });

    const replyEmbed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { color: "#527ea3", timestamp: true }
    );

    replyEmbed.setAuthor("Report Summary")
        .setDescription(
            `**Offender**: ${toReport} (${toReport.id})
            **Channel**: ${interaction.channel}
            **Reason**: ${reason}
            
            Remember to save your evidence in case it is needed.`
        );
    
    interaction.user.send({ embeds: [replyEmbed] })
        .catch(
            () => interaction.editReply({
                content: MessageCreator.createWarn(
                    reportStrings.reporterDmLocked, interaction.user.toString()
                )
            })
        );
};

export const category: Command["category"] = CommandCategory.GENERAL;

export const config: Command["config"] = {
    name: "report",
    description: "Reports a user for breaking rules.",
    options: [
        {
            name: "user",
            required: true,
            type: CommandArgumentType.USER,
            description: "The user to report."
        },
        {
            name: "reason",
            required: true,
            type: CommandArgumentType.STRING,
            description: "The reason for reporting. Maximum length is 1500 characters."
        }
    ],
    example: [
        {
            command: "report @Rian8337#0001 Posting NSFW",
            description: "will report Rian8337 for \"Posting NSFW\"."
        },
        {
            command: "report 132783516176875520 Spamming",
            description: "will report the user with that Discord ID for \"Spamming\"."
        }
    ],
    permissions: [],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL"
};