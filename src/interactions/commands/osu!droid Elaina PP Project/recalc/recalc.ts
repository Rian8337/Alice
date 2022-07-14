import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.PP;

export const config: SlashCommand["config"] = {
    name: "recalc",
    description:
        "The main command for droid performance points (dpp) recalculation system.",
    options: [
        {
            name: "all",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Recalculates all users in the droid performance points (dpp) system.",
            options: [
                {
                    name: "full",
                    type: ApplicationCommandOptionTypes.BOOLEAN,
                    description:
                        "Whether to consider all plays or only top 75 submitted plays.",
                },
            ],
        },
        {
            name: "prototype",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description:
                "Main subcommand for prototype droid performance points (dpp) system.",
            options: [
                {
                    name: "calculate",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Recalculates a user as prototype droid performance points (dpp).",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionTypes.USER,
                            description: "The user to recalculate.",
                        },
                        {
                            name: "uid",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description: "The uid of the user.",
                        },
                        {
                            name: "username",
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The username of the user.",
                        },
                    ],
                },
                {
                    name: "calculateall",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Recalculates all players in the current prototype droid performance points (dpp) system.",
                    options: [
                        {
                            name: "resetprogress",
                            type: ApplicationCommandOptionTypes.BOOLEAN,
                            description:
                                "Whether to reset the progress of the previous recalculation.",
                        },
                    ],
                },
            ],
        },
        {
            name: "user",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Recalculates all scores of a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
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
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL",
};
