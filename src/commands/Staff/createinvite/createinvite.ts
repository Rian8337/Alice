import {
    GuildMember,
    MessageEmbed,
    NewsChannel,
    TextChannel,
} from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { CreateinviteLocalization } from "@alice-localization/commands/Staff/createinvite/CreateinviteLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: CreateinviteLocalization = new CreateinviteLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const maxAge: number = DateTimeFormatHelper.DHMStoSeconds(
        interaction.options.getString("validduration") ?? "0"
    );

    if (!NumberHelper.isNumeric(maxAge) || maxAge < 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("expiryTimeInvalid")
            ),
        });
    }

    const maxUsage: number = interaction.options.getInteger("usage") ?? 0;

    if (maxUsage < 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("maximumUsageInvalid")
            ),
        });
    }

    const reason: string =
        interaction.options.getString("reason") ??
        localization.getTranslation("notSpecified");

    (<TextChannel | NewsChannel>interaction.channel)
        .createInvite({ maxAge: maxAge, maxUses: maxUsage, reason: reason })
        .then((invite) => {
            const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
                author: interaction.user,
                color: (<GuildMember>interaction.member).displayColor,
                timestamp: true,
            });

            embed
                .setTitle(localization.getTranslation("inviteLinkCreated"))
                .addField(
                    localization.getTranslation("createdInChannel"),
                    interaction.channel!.toString(),
                    true
                )
                .addField(
                    localization.getTranslation("maxUsage"),
                    maxUsage === 0
                        ? localization.getTranslation("infinite")
                        : maxUsage.toString()
                )
                .addField(
                    localization.getTranslation("expirationTime"),
                    DateTimeFormatHelper.secondsToDHMS(
                        maxAge,
                        localization.language
                    ) || localization.getTranslation("never"),
                    true
                )
                .addField(localization.getTranslation("reason"), reason)
                .addField(
                    localization.getTranslation("inviteLink"),
                    invite.url
                );

            InteractionHelper.reply(interaction, {
                embeds: [embed],
            });
        });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "createinvite",
    description: "Creates an invite link to the channel.",
    options: [
        {
            name: "validduration",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "In time format (e.g. 6:01:24:33 or 2d14h55m34s). Defaults to never expire.",
        },
        {
            name: "usage",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The maximum usage until the invite link expires. Defaults to no limit.",
            minValue: 0,
        },
        {
            name: "reason",
            type: ApplicationCommandOptionTypes.STRING,
            description: "The reason for creating the invite link.",
        },
    ],
    example: [
        {
            command: "createinvite",
            arguments: [
                {
                    name: "validduration",
                    value: "14d",
                },
                {
                    name: "usage",
                    value: 10,
                },
            ],
            description:
                "will create an invite link that expires on either 14 days or after 10 users have used the invite link.",
        },
        {
            command: "createinvite",
            arguments: [
                {
                    name: "reason",
                    value: "Permanent invite link",
                },
            ],
            description:
                'will create an invite link that never expires for "Permanent invite link".',
        },
    ],
    permissions: ["CREATE_INSTANT_INVITE"],
    scope: "GUILD_CHANNEL",
};
