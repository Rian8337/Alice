import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: CommandCategory = CommandCategory.PP;

export const config: SlashCommand["config"] = {
    name: "pp",
    description: "Main command of the droid pp system.",
    options: [
        {
            name: "check",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Checks yours or a player's droid pp (dpp) profile.",
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
        {
            name: "compare",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description:
                "Compares yours or a player's droid pp (dpp) profile with another player's droid pp (dpp) profile.",
            options: [
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Compares two players' droid pp (dpp) profile using their uid.",
                    options: [
                        {
                            name: "uidtocompare",
                            required: true,
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description: "The uid to compare against.",
                        },
                        {
                            name: "otheruid",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The other uid to compare against. If unspecified, defaults to yourself.",
                        },
                    ],
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Compares two players' droid pp (dpp) profile using their binded Discord account.",
                    options: [
                        {
                            name: "usertocompare",
                            required: true,
                            type: ApplicationCommandOptionTypes.USER,
                            description: "The Discord user to compare against.",
                        },
                        {
                            name: "otheruser",
                            type: ApplicationCommandOptionTypes.USER,
                            description:
                                "The other Discord user to compare against. If unspecified, defaults to yourself.",
                        },
                    ],
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Compares two players' droid pp (dpp) profile using their username.",
                    options: [
                        {
                            name: "usernametocompare",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The username to compare against.",
                        },
                        {
                            name: "otherusername",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The other username to compare against. If unspecified, defaults to yourself.",
                        },
                    ],
                },
            ],
        },
        {
            name: "prototype",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description:
                "Main subcommand group for checking a player's prototype droid pp (dpp) profile.",
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
        },
        {
            name: "submit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Submits one or more score(s) the droid pp system.",
            options: [
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Submits a score from a beatmap.",
                    options: [
                        {
                            name: "beatmap",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The beatmap ID or link.",
                        },
                    ],
                },
                {
                    name: "recent",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Submits score(s) from your recent plays.",
                    options: [
                        {
                            name: "amount",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The amount of score(s) to submit, ranging from 1 to 5. Defaults to 1.",
                            minValue: 1,
                            maxValue: 5,
                        },
                        {
                            name: "offset",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The index offset in your recent play list that you want to start submitting, ranging from 1 to 50.",
                            minValue: 1,
                            maxValue: 50,
                        },
                    ],
                },
            ],
        },
        {
            name: "whatif",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Calculates changes in overall pp and user stats when a user gets a certain pp play.",
            options: [
                {
                    name: "pp",
                    type: ApplicationCommandOptionTypes.NUMBER,
                    required: true,
                    description:
                        "The theoretical amount of pp achieved on a beatmap.",
                    minValue: 0,
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to check.",
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
    ],
    example: [
        {
            command: "pp check",
            description:
                "will give a list of your submitted plays in droid pp system.",
        },
        {
            command: "pp check",
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
                "will give a list of Rian8337's submitted plays in droid pp system at page 5.",
        },
        {
            command: "pp check",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will give a list of the user with that Discord ID's submitted plays in droid pp system.",
        },
        {
            command: "pp check",
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
                "will give a list of that username's submitted plays in droid pp system at page 7.",
        },
        {
            command: "pp check",
            arguments: [
                {
                    name: "uid",
                    value: 11678,
                },
            ],
            description:
                "will give a list of that uid's submitted plays in droid pp system.",
        },
        {
            command: "pp prototype view",
            description:
                "will give a list of your submitted plays in prototype droid pp system.",
        },
        {
            command: "pp prototype view",
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
            command: "pp prototype view",
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
            command: "pp prototype view",
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
            command: "pp prototype view",
            arguments: [
                {
                    name: "uid",
                    value: 11678,
                },
            ],
            description:
                "will give a list of that uid's submitted plays in prototype droid pp system.",
        },
        {
            command: "pp submit recent",
            description: "will submit your most recent play.",
        },
        {
            command: "pp submit recent",
            arguments: [
                {
                    name: "amount",
                    value: 3,
                },
            ],
            description:
                "will submit your 1st, 2nd, and 3rd most recent plays.",
        },
        {
            command: "pp submit recent",
            arguments: [
                {
                    name: "amount",
                    value: 4,
                },
                {
                    name: "offset",
                    value: 18,
                },
            ],
            description:
                "will submit your 18th, 19th, 20th, and 21th most recent plays.",
        },
        {
            command: "pp submit beatmap",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description: "will submit your score from the linked beatmap.",
        },
        {
            command: "pp submit beatmap",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
            ],
            description:
                "will submit your score from the beatmap with that ID.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
