import { GuildMember } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { CoinsLocalization } from "@alice-localization/interactions/commands/Fun/coins/CoinsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (
        DateTimeFormatHelper.getTimeDifference(
            (<GuildMember>interaction.member).joinedAt!
        ) >
        -86400 * 1000 * 7
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotInServerForAWeek")
            ),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        localization.language
    );
};

export const category: SlashCommand["category"] = CommandCategory.fun;

export const config: SlashCommand["config"] = {
    name: "coins",
    description: "Main command for Alice coins.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Adds Alice coins to a user (bot owner only).",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to add Alice coins to.",
                },
                {
                    name: "amount",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The amount of Alice coins to add.",
                    minValue: 0,
                },
            ],
        },
        {
            name: "claim",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Claim daily Alice coins.",
        },
        {
            name: "remove",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Remove Alice coins from a user (bot owner only).",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to remove Alice coins from.",
                },
                {
                    name: "amount",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The amount of Alice coins to remove.",
                    minValue: 0,
                },
            ],
        },
        {
            name: "transfer",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Transfer your Alice coins to a user",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to transfer Alice coins to.",
                },
                {
                    name: "amount",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The amount of Alice coins to transfer.",
                    minValue: 0,
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionType.Subcommand,
            description: "View a user's Alice coins.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user to view. Defaults to yourself.",
                },
            ],
        },
    ],
    example: [
        {
            command: "coins claim",
            description: "will claim your daily Alice coins.",
        },
        {
            command: "coins transfer",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "amount",
                    value: 500,
                },
            ],
            description: "will transfer 500 Alice coins to Rian8337.",
        },
        {
            command: "coins view",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will view the amount of Alice coins of the Discord account with that ID.",
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
