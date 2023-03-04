import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Constants } from "@alice-core/Constants";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.pp;

export const config: SlashCommand["config"] = {
    name: "recalc",
    description:
        "The main command for droid performance points (dpp) recalculation system.",
    options: [
        {
            name: "all",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Recalculates all users in the droid performance points (dpp) system.",
            options: [
                {
                    name: "full",
                    type: ApplicationCommandOptionType.Boolean,
                    description:
                        "Whether to consider all plays or only top 75 submitted plays.",
                },
            ],
        },
        {
            name: "prototype",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description:
                "Main subcommand for prototype droid performance points (dpp) system.",
            options: [
                {
                    name: "calculate",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Recalculates a user as prototype droid performance points (dpp).",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionType.User,
                            description: "The user to recalculate.",
                        },
                        {
                            name: "uid",
                            type: ApplicationCommandOptionType.Integer,
                            description: "The uid of the user.",
                            minValue: Constants.uidMinLimit,
                        },
                        {
                            name: "username",
                            type: ApplicationCommandOptionType.String,
                            description: "The username of the user.",
                            minLength: 2,
                            maxLength: 20,
                            autocomplete: true,
                        },
                    ],
                },
                {
                    name: "calculateall",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Recalculates all players in the current prototype droid performance points (dpp) system.",
                    options: [
                        {
                            name: "resetprogress",
                            type: ApplicationCommandOptionType.Boolean,
                            description:
                                "Whether to reset the progress of the previous recalculation.",
                        },
                    ],
                },
            ],
        },
        {
            name: "user",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Recalculates all scores of a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to recalculate.",
                },
            ],
        },
    ],
    example: [
        {
            command: "recalc all",
            arguments: [
                {
                    name: "full",
                    value: true,
                },
            ],
            description:
                "will recalculate all scores of all users in the droid performance points (dpp) system.",
        },
        {
            command: "recalc user",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will recalculate Rian8337's scores.",
        },
        {
            command: "recalc user",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will recalculate the scores of the user with that Discord ID.",
        },
    ],
    permissions: ["Special"],
    scope: "GUILD_CHANNEL",
};
