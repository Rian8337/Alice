import { GuildMember } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { CoinsLocalization } from "@alice-localization/commands/Fun/coins/CoinsLocalization";
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

export const category: SlashCommand["category"] = CommandCategory.FUN;

export const config: SlashCommand["config"] = {
    name: "coins",
    description: "Main command for Alice coins.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Adds Alice coins to a user (bot owner only).",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to add Alice coins to.",
                },
                {
                    name: "amount",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The amount of Alice coins to add.",
                },
            ],
        },
        {
            name: "claim",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Claim daily Alice coins.",
        },
        {
            name: "remove",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Remove Alice coins from a user (bot owner only).",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to remove Alice coins from.",
                },
                {
                    name: "amount",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The amount of Alice coins to remove.",
                },
            ],
        },
        {
            name: "transfer",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Transfer your Alice coins to a user",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to transfer Alice coins to.",
                },
                {
                    name: "amount",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The amount of Alice coins to transfer.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View a user's Alice coins.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
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
