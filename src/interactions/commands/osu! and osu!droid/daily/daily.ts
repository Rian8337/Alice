import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "daily",
    description: "Main command for daily and weekly challenges.",
    options: [
        {
            name: "about",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "All you need to know about daily and weekly challenges!",
        },
        {
            name: "bonuses",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Views bonuses for the current ongoing challenge.",
            options: [
                {
                    name: "type",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The type of the challenge. Defaults to daily.",
                    choices: [
                        {
                            name: "Daily",
                            value: "daily",
                        },
                        {
                            name: "Weekly",
                            value: "weekly",
                        },
                    ],
                },
            ],
        },
        {
            name: "check",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Checks the current ongoing challenge.",
            options: [
                {
                    name: "type",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The type of the challenge. Defaults to daily.",
                    choices: [
                        {
                            name: "Daily",
                            value: "daily",
                        },
                        {
                            name: "Weekly",
                            value: "weekly",
                        },
                    ],
                },
            ],
        },
        {
            name: "checksubmit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Checks if you, an osu!droid account, or Discord user has completed a challenge.",
            options: [
                {
                    name: "challengeid",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The ID of the challenge.",
                },
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username the osu!droid account.",
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user.",
                },
            ],
        },
        {
            name: "challenges",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Manages challenges.",
            options: [
                {
                    name: "add",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Adds a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "beatmap",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description:
                                "The beatmap ID or link that will be used in the challenge.",
                        },
                        {
                            name: "points",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            description:
                                "The amount of points awarded for completing the challenge.",
                            minValue: 1,
                        },
                        {
                            name: "passrequirement",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The type of the pass requirement.",
                            choices: Challenge.passCommandChoices,
                        },
                        {
                            name: "passvalue",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description:
                                "The value that must be fulfilled to pass the challenge.",
                        },
                        {
                            name: "featured",
                            type: ApplicationCommandOptionTypes.USER,
                            description:
                                "The user who featured the challenge. Defaults to yourself.",
                        },
                        {
                            name: "constrain",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The mods required to complete the challenge. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "beatmap",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Changes the beatmap used in a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                    ],
                },
                {
                    name: "beatmapfile",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Gets the beatmap file of a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                    ],
                },
                {
                    name: "bonus",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Adds or modifies a bonus.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "type",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The type of the bonus.",
                            choices: Challenge.bonusCommandChoices,
                        },
                        {
                            name: "level",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            description: "The level of the bonus.",
                            minValue: 1,
                        },
                        {
                            name: "value",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The value to set the bonus to. Omit to delete the bonus level.",
                        },
                    ],
                },
                {
                    name: "check",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Similar to /daily check, but will respond privately.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                    ],
                },
                {
                    name: "constrain",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Modifies the constrain of a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "constrain",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The mods required to complete the challenge. Omit to clear the challenge's constrain.",
                        },
                    ],
                },
                {
                    name: "delete",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Deletes a challenge given that it's still scheduled.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                    ],
                },
                {
                    name: "downloadlink",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Sets the download link to the beatmapset of the challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "link1",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The download link.",
                        },
                        {
                            name: "link2",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The alternative download link, if any.",
                        },
                    ],
                },
                {
                    name: "featured",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Modifies the featured user of a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "user",
                            type: ApplicationCommandOptionTypes.USER,
                            description:
                                "The user to feature. Defaults to yourself.",
                        },
                    ],
                },
                {
                    name: "passrequirement",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Modifies the pass requirement of a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "type",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description:
                                "The type of the new pass requirement.",
                            choices: Challenge.passCommandChoices,
                        },
                        {
                            name: "value",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description:
                                "The value that must be fulfilled to pass the challenge.",
                        },
                    ],
                },
                {
                    name: "points",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Modifies the points awarded in a challenge.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                        {
                            name: "points",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            description:
                                "The points awarded for completing the challenge.",
                            minValue: 1,
                        },
                    ],
                },
                {
                    name: "viewbonus",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Similar to /daily bonuses, but will respond privately.",
                    options: [
                        {
                            name: "id",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The ID of the challenge.",
                        },
                    ],
                },
            ],
        },
        {
            name: "leaderboard",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Views daily and weekly challenges leaderboard.",
            options: [
                {
                    name: "page",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The page to view. Defaults to 1.",
                },
            ],
        },
        {
            name: "manualsubmit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Manually submits a replay towards the current ongoing challenge.",
            options: [
                {
                    name: "replay",
                    required: true,
                    type: ApplicationCommandOptionTypes.ATTACHMENT,
                    description: "The replay file (.odr).",
                },
            ],
        },
        {
            name: "profile",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Checks yours or an osu!droid account's challenge profile.",
            options: [
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username the osu!droid account.",
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user.",
                },
            ],
        },
        {
            name: "start",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Starts a challenge.",
            options: [
                {
                    name: "challengeid",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The ID of the challenge.",
                },
            ],
        },
        {
            name: "submit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Submits your 50 most recent plays towards the current ongoing challenge.",
            options: [
                {
                    name: "type",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The type of the challenge. Defaults to daily.",
                    choices: [
                        {
                            name: "Daily",
                            value: "daily",
                        },
                        {
                            name: "Weekly",
                            value: "weekly",
                        },
                    ],
                },
            ],
        },
    ],
    example: [
        {
            command: "daily checksubmit",
            arguments: [
                {
                    name: "challengeid",
                    value: "d21",
                },
            ],
            description: "will check if you have played challenge `d21`.",
        },
        {
            command: "daily manualsubmit",
            description:
                "will submit the provided replay to be verified against the current daily or weekly challenge.",
        },
        {
            command: "daily submit",
            description:
                "will submit your 50 most recent plays towards the current ongoing daily challenge.",
        },
    ],
    permissions: [],
    cooldown: 5,
    scope: "GUILD_CHANNEL",
};
