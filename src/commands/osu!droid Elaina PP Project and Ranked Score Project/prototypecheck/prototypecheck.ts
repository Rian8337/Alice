import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "prototypecheck",
    description:
        "Main command for checking a player's prototype droid pp (dpp) profile.",
    options: [
        {
            name: "export",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Exports yours or a player's prototype droid pp (dpp) profile.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to export.",
                },
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the player.",
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username of the player.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Checks yours or a player's prototype droid pp (dpp) profile.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to check.",
                },
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the player.",
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username of the player.",
                },
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Defaults to 1.",
                    minValue: 1,
                    maxValue: 15,
                },
            ],
        },
    ],
    example: [
        {
            command: "prototypecheck view",
            description:
                "will give a list of your submitted plays in prototype droid pp system.",
        },
        {
            command: "prototypecheck view",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "page",
                    value: 5,
                },
            ],
            description:
                "will give a list of Rian8337's submitted plays in prototype droid pp system at page 5.",
        },
        {
            command: "prototypecheck view",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will give a list of the user with that Discord ID's submitted plays in prototype droid pp system.",
        },
        {
            command: "prototypecheck view",
            arguments: [
                {
                    name: "username",
                    value: "dgsrz",
                },
                {
                    name: "page",
                    value: 7,
                },
            ],
            description:
                "will give a list of that username's submitted plays in prototype droid pp system at page 7.",
        },
        {
            command: "prototypecheck view",
            arguments: [
                {
                    name: "uid",
                    value: 11678,
                },
            ],
            description:
                "will give a list of that uid's submitted plays in prototype droid pp system.",
        },
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL",
};
