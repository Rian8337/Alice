import {
    GuildMember,
    EmbedBuilder,
    NewsChannel,
    TextChannel,
    InteractionContextType,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { CreateinviteLocalization } from "@localization/interactions/commands/Staff/createinvite/CreateinviteLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: CreateinviteLocalization = new CreateinviteLocalization(
        CommandHelper.getLocale(interaction),
    );

    const maxAge: number = DateTimeFormatHelper.DHMStoSeconds(
        interaction.options.getString("validduration") ?? "0",
    );

    if (!NumberHelper.isNumeric(maxAge) || maxAge < 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("expiryTimeInvalid"),
            ),
        });
    }

    const maxUsage: number = interaction.options.getInteger("usage") ?? 0;

    if (maxUsage < 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("maximumUsageInvalid"),
            ),
        });
    }

    const reason: string =
        interaction.options.getString("reason") ??
        localization.getTranslation("notSpecified");

    (<TextChannel | NewsChannel>interaction.channel)
        .createInvite({ maxAge: maxAge, maxUses: maxUsage, reason: reason })
        .then((invite) => {
            const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
                author: interaction.user,
                color: (<GuildMember>interaction.member).displayColor,
                timestamp: true,
            });

            embed
                .setTitle(localization.getTranslation("inviteLinkCreated"))
                .addFields(
                    {
                        name: localization.getTranslation("createdInChannel"),
                        value: interaction.channel!.toString(),
                        inline: true,
                    },
                    {
                        name: localization.getTranslation("maxUsage"),
                        value:
                            maxUsage === 0
                                ? localization.getTranslation("infinite")
                                : maxUsage.toString(),
                    },
                    {
                        name: localization.getTranslation("expirationTime"),
                        value:
                            DateTimeFormatHelper.secondsToDHMS(
                                maxAge,
                                localization.language,
                            ) || localization.getTranslation("never"),
                        inline: true,
                    },
                    {
                        name: localization.getTranslation("reason"),
                        value: reason,
                    },
                    {
                        name: localization.getTranslation("inviteLink"),
                        value: invite.url,
                    },
                );

            InteractionHelper.reply(interaction, {
                embeds: [embed],
            });
        });
};

export const category: SlashCommand["category"] = CommandCategory.staff;

export const config: SlashCommand["config"] = {
    name: "createinvite",
    description: "Creates an invite link to the channel.",
    options: [
        {
            name: "validduration",
            type: ApplicationCommandOptionType.String,
            description:
                "In time format (e.g. 6:01:24:33 or 2d14h55m34s). Defaults to never expire.",
        },
        {
            name: "usage",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The maximum usage until the invite link expires. Defaults to no limit.",
            minValue: 0,
        },
        {
            name: "reason",
            type: ApplicationCommandOptionType.String,
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
    permissions: ["CreateInstantInvite"],
    contexts: [InteractionContextType.Guild],
};
