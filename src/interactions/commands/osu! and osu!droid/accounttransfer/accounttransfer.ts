import { Constants } from "@core/Constants";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "@structures/core/SlashCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "accounttransfer",
    description: "Command for osu!droid account transfers.",
    options: [
        {
            name: "about",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Shows information about the osu!droid account transfer.",
        },
        {
            name: "account",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Switches the osu!droid account that your scores will be transferred to.",
            options: [
                {
                    name: "uid",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the osu!droid account.",
                    required: true,
                },
            ],
        },
        {
            name: "add",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Adds an osu!droid account to your transfer list.",
            options: [
                {
                    name: "uid",
                    description: "The uid of the osu!droid account.",
                    type: ApplicationCommandOptionType.Integer,
                    minValue: Constants.uidMinLimit,
                    maxValue: Constants.uidMaxLimit,
                    required: true,
                },
                {
                    name: "email",
                    description: "The email of the osu!droid account.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "info",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Displays an information about your osu!droid account transfer.",
        },
    ],
    example: [],
    permissions: [],
    scope: "ALL",
    replyEphemeral: true,
};
