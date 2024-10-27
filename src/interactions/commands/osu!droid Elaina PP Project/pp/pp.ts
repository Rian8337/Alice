import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";
import { Constants } from "@core/Constants";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        CommandHelper.getLocale(interaction),
    );
};

export const category: CommandCategory = CommandCategory.pp;

export const config: SlashCommand["config"] = {
    name: "pp",
    description: "Main command of the droid pp system.",
    options: [
        {
            name: "check",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Checks yours or a player's droid pp (dpp) profile.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user to check.",
                },
                {
                    name: "uid",
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the player.",
                    minValue: Constants.uidMinLimit,
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionType.String,
                    description: "The username of the player.",
                    minLength: 2,
                    maxLength: 20,
                    autocomplete: true,
                },
                {
                    name: "page",
                    type: ApplicationCommandOptionType.Integer,
                    description:
                        "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Defaults to 1.",
                    minValue: 1,
                    maxValue: 15,
                },
            ],
        },
        {
            name: "compare",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description:
                "Compares yours or a player's droid pp (dpp) profile with another player's droid pp (dpp) profile.",
            options: [
                {
                    name: "uid",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Compares two players' droid pp (dpp) profile using their uid.",
                    options: [
                        {
                            name: "uidtocompare",
                            required: true,
                            type: ApplicationCommandOptionType.Integer,
                            description: "The uid to compare against.",
                            minValue: Constants.uidMinLimit,
                        },
                        {
                            name: "otheruid",
                            type: ApplicationCommandOptionType.Integer,
                            description:
                                "The other uid to compare against. If unspecified, defaults to yourself.",
                            minValue: Constants.uidMinLimit,
                        },
                    ],
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Compares two players' droid pp (dpp) profile using their bound Discord account.",
                    options: [
                        {
                            name: "usertocompare",
                            required: true,
                            type: ApplicationCommandOptionType.User,
                            description: "The Discord user to compare against.",
                        },
                        {
                            name: "otheruser",
                            type: ApplicationCommandOptionType.User,
                            description:
                                "The other Discord user to compare against. If unspecified, defaults to yourself.",
                        },
                    ],
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Compares two players' droid pp (dpp) profile using their username.",
                    options: [
                        {
                            name: "usernametocompare",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The username to compare against.",
                            minLength: 2,
                            maxLength: 20,
                            autocomplete: true,
                        },
                        {
                            name: "otherusername",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The other username to compare against. If unspecified, defaults to yourself.",
                            minLength: 2,
                            maxLength: 20,
                            autocomplete: true,
                        },
                    ],
                },
            ],
        },
        {
            name: "prototype",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description:
                "Main subcommand group for checking a player's prototype droid pp (dpp) profile.",
            options: [
                {
                    name: "check",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Checks yours or a player's prototype droid pp (dpp) profile.",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionType.User,
                            description: "The user to check.",
                        },
                        {
                            name: "uid",
                            type: ApplicationCommandOptionType.Integer,
                            description: "The uid of the player.",
                            minValue: Constants.uidMinLimit,
                        },
                        {
                            name: "username",
                            type: ApplicationCommandOptionType.String,
                            description: "The username of the player.",
                            minLength: 2,
                            maxLength: 20,
                            autocomplete: true,
                        },
                        {
                            name: "page",
                            type: ApplicationCommandOptionType.Integer,
                            description:
                                "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Defaults to 1.",
                            minValue: 1,
                            maxValue: 15,
                        },
                        {
                            name: "rework",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The rework to check. If unspecified, defaults to the overall rework.",
                            autocomplete: true,
                        },
                    ],
                },
                {
                    name: "export",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Exports yours or a player's prototype droid pp (dpp) profile.",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionType.User,
                            description: "The user to export.",
                        },
                        {
                            name: "uid",
                            type: ApplicationCommandOptionType.Integer,
                            description: "The uid of the player.",
                            minValue: Constants.uidMinLimit,
                        },
                        {
                            name: "username",
                            type: ApplicationCommandOptionType.String,
                            description: "The username of the player.",
                            minLength: 2,
                            maxLength: 20,
                            autocomplete: true,
                        },
                        {
                            name: "rework",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The rework to export. If unspecified, defaults to the overall rework.",
                            autocomplete: true,
                        },
                    ],
                },
            ],
        },
        {
            name: "submit",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Submits one or more score(s) the droid pp system.",
            options: [
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Submits a score from a beatmap.",
                    options: [
                        {
                            name: "beatmap",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The beatmap ID or link.",
                        },
                    ],
                },
                {
                    name: "recent",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Submits score(s) from your recent plays.",
                    options: [
                        {
                            name: "amount",
                            type: ApplicationCommandOptionType.Integer,
                            description:
                                "The amount of score(s) to submit, ranging from 1 to 5. Defaults to 1.",
                            minValue: 1,
                            maxValue: 5,
                        },
                        {
                            name: "offset",
                            type: ApplicationCommandOptionType.Integer,
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
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Calculates changes in overall pp and user stats when a user gets a certain pp play.",
            options: [
                {
                    name: "pp",
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    description:
                        "The theoretical amount of pp achieved on a beatmap.",
                    minValue: 0,
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user to check.",
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
