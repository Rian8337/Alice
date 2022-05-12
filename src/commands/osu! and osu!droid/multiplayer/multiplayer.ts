import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "multiplayer",
    description:
        "Main command for the Discord bot-facilitated multiplayer system.",
    options: [
        {
            name: "beatmap",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Manages picked beatmaps for a multiplayer room.",
            options: [
                {
                    name: "select",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Selects the beatmap that will be played.",
                    options: [
                        {
                            name: "beatmap",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description: "The beatmap ID or link.",
                        },
                    ],
                },
                {
                    name: "view",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Views the currently picked beatmap.",
                },
            ],
        },
        {
            name: "create",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Creates a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true,
                    description:
                        "The ID of the multiplayer room. Maximum is 20 characters.",
                },
                {
                    name: "name",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true,
                    description:
                        "The name of the multiplayer room. Maximum is 50 characters.",
                },
                {
                    name: "password",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The password required to join the multiplayer room. Defaults to none.",
                },
                {
                    name: "maxplayers",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The amount of player slots available in the multiplayer room. Defaults to 8.",
                    minValue: 2,
                    maxValue: 20,
                },
            ],
        },
        {
            name: "leave",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Leaves the multiplayer room.",
        },
        {
            name: "join",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Joins a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true,
                    description: "The ID of the multiplayer room.",
                },
                {
                    name: "password",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The password of the multiplayer room, if any.",
                },
            ],
        },
        {
            name: "kick",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Kicks a player from the multiplayer room.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    required: true,
                    description: "The user to kick.",
                },
                {
                    name: "lockslot",
                    type: ApplicationCommandOptionTypes.BOOLEAN,
                    description: "Whether to also lock the player's slot.",
                },
            ],
        },
        {
            name: "ready",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Toggles the ready state.",
        },
        {
            name: "round",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Round management.",
            options: [
                {
                    name: "forcesubmit",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Forcefully submits the round's result.",
                },
                {
                    name: "start",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Starts a timer until round start.",
                    options: [
                        {
                            name: "force",
                            type: ApplicationCommandOptionTypes.BOOLEAN,
                            description:
                                "Whether to forcefully start the round regardless of ready state of all players.",
                        },
                        {
                            name: "duration",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The duration of the timer, in seconds. Defaults to 15.",
                            minValue: 5,
                            maxValue: 15,
                        },
                    ],
                },
                {
                    name: "stop",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Stops the ongoing timer in the room.",
                },
            ],
        },
        {
            name: "settings",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Manages settings for the multiplayer room.",
            options: [
                {
                    name: "allowedmods",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets allowed mods to play.",
                    options: [
                        {
                            name: "mods",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The mods to set to. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "forcear",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the usage rule of force AR.",
                    options: [
                        {
                            name: "allowed",
                            type: ApplicationCommandOptionTypes.BOOLEAN,
                            description:
                                "Whether to allow the usage of force AR. Defaults to previously picked option or no.",
                        },
                        {
                            name: "minvalue",
                            type: ApplicationCommandOptionTypes.NUMBER,
                            description:
                                "The lowest allowable force AR value to use. Defaults to previously picked option or 0.",
                            minValue: 0,
                            maxValue: 12.5,
                        },
                        {
                            name: "maxvalue",
                            type: ApplicationCommandOptionTypes.NUMBER,
                            description:
                                "The highest allowable force AR value to use. Defaults to previously picked option or 12.5.",
                            minValue: 0,
                            maxValue: 12.5,
                        },
                    ],
                },
                {
                    name: "name",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the name of the multiplayer room.",
                    options: [
                        {
                            name: "name",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                            description:
                                "The name of the multiplayer room. Maximum is 50 characters.",
                        },
                    ],
                },
                {
                    name: "maxplayers",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Sets the amount of player slots in the multiplayer room.",
                    options: [
                        {
                            name: "slotamount",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            description: "The amount of player slots.",
                            minValue: 2,
                            maxValue: 20,
                        },
                    ],
                },
                {
                    name: "password",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Sets or removes the password required to join the multiplayer room.",
                    options: [
                        {
                            name: "password",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The password to set to. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "requiredmods",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets required mods to play.",
                    options: [
                        {
                            name: "mods",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The mods to set to. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "scoreportion",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Sets the portion of which the maximum score will contribute to ScoreV2, if win condition is ScoreV2.",
                    options: [
                        {
                            name: "value",
                            type: ApplicationCommandOptionTypes.NUMBER,
                            description:
                                "The value to set the score portion to. Defaults to 0.4.",
                            minValue: 0,
                            maxValue: 1,
                        },
                    ],
                },
                {
                    name: "speedmultiplier",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the custom speed multiplier to use.",
                    options: [
                        {
                            name: "value",
                            type: ApplicationCommandOptionTypes.NUMBER,
                            description:
                                "The custom speed multiplier value to use. Must be divisible by 0.05. Defaults to 1.",
                            minValue: 0.5,
                            maxValue: 2,
                        },
                    ],
                },
                {
                    name: "teammode",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the team mode of the multiplayer room.",
                    options: [
                        {
                            name: "teammode",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description: "The team mode to set to.",
                            choices: [
                                {
                                    name: "Head-to-head",
                                    value: MultiplayerTeamMode.headToHead,
                                },
                                {
                                    name: "Team VS",
                                    value: MultiplayerTeamMode.teamVS,
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "transferhost",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Transfers host status to another player in the multiplayer room.",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionTypes.USER,
                            required: true,
                            description:
                                "The player to transfer host status to.",
                        },
                    ],
                },
                {
                    name: "view",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Views the currently configured multiplayer room settings.",
                },
                {
                    name: "wincondition",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the win condition.",
                    options: [
                        {
                            name: "condition",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            description: "The win condition.",
                            choices: [
                                {
                                    name: "Score V1",
                                    value: MultiplayerWinCondition.scoreV1,
                                },
                                {
                                    name: "Accuracy",
                                    value: MultiplayerWinCondition.accuracy,
                                },
                                {
                                    name: "Maximum Combo",
                                    value: MultiplayerWinCondition.maxCombo,
                                },
                                {
                                    name: "Score V2",
                                    value: MultiplayerWinCondition.scoreV2,
                                },
                                {
                                    name: "Most 300s",
                                    value: MultiplayerWinCondition.most300,
                                },
                                {
                                    name: "Least 100s",
                                    value: MultiplayerWinCondition.least100,
                                },
                                {
                                    name: "Least 50s",
                                    value: MultiplayerWinCondition.least50,
                                },
                                {
                                    name: "Least Misses",
                                    value: MultiplayerWinCondition.leastMisses,
                                },
                                {
                                    name: "Least Unstable Rate",
                                    value: MultiplayerWinCondition.leastUnstableRate,
                                },
                                {
                                    name: "Most Droid PP",
                                    value: MultiplayerWinCondition.mostDroidPp,
                                },
                                {
                                    name: "Most PC PP",
                                    value: MultiplayerWinCondition.mostPcPp,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            name: "spectate",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Toggles spectating state for the room host without having to leave the multiplayer room.",
        },
        {
            name: "statistics",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Displays the statistics of a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The ID of the multiplayer room. If omitted, defaults to the current channel's multiplayer room.",
                },
            ],
        },
        {
            name: "team",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Manages teams for a multiplayer room.",
            options: [
                {
                    name: "select",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Moves to a team.",
                    options: [
                        {
                            name: "team",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            description: "The team to move to.",
                            choices: [
                                {
                                    name: "Red",
                                    value: MultiplayerTeam.red,
                                },
                                {
                                    name: "Blue",
                                    value: MultiplayerTeam.blue,
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "view",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Views the current team configuration in a multiplayer room.",
                },
            ],
        },
    ],
    example: [],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
