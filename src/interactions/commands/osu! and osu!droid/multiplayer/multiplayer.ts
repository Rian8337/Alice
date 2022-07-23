import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "multiplayer",
    description:
        "Main command for the Discord bot-facilitated multiplayer system.",
    options: [
        {
            name: "about",
            type: ApplicationCommandOptionType.Subcommand,
            description: "About this multiplayer system.",
        },
        {
            name: "beatmap",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Manages picked beatmaps for a multiplayer room.",
            options: [
                {
                    name: "select",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Selects the beatmap that will be played.",
                    options: [
                        {
                            name: "beatmap",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            description: "The beatmap ID or link.",
                        },
                    ],
                },
                {
                    name: "view",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Views the currently picked beatmap.",
                },
            ],
        },
        {
            name: "calculate",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description:
                "Calculation commands to calculate scores that are not submitted.",
            options: [
                {
                    name: "scorev1",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Modifies a ScoreV1 value to account for custom mod multipliers.",
                    options: [
                        {
                            name: "score",
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            description: "The score value to calculate for.",
                            minValue: 0,
                        },
                        {
                            name: "mods",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            description:
                                "The combination of modos to calculate for.",
                        },
                    ],
                },
                {
                    name: "scorev2",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Calculates a ScoreV2 value with respect to the currently picked beatmap.",
                    options: [
                        {
                            name: "score",
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            description: "The score value to calculate for.",
                            minValue: 0,
                        },
                        {
                            name: "accuracy",
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            description:
                                "The accuracy to calculate for, from 0 to 100.",
                            minValue: 0,
                            maxValue: 100,
                        },
                        {
                            name: "misses",
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            description:
                                "The amount of misses to calculate for.",
                            minValue: 0,
                        },
                        {
                            name: "mods",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The combination of mods to calculate for. Used to apply HDDT penalty and custom mod multipliers.",
                        },
                    ],
                },
            ],
        },
        {
            name: "create",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Creates a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    description: "The ID of the room.",
                    maxLength: 20,
                },
                {
                    name: "name",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    description: "The name of the room.",
                    maxLength: 50,
                },
                {
                    name: "password",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The password required to join the room. Defaults to none.",
                },
                {
                    name: "slotamount",
                    type: ApplicationCommandOptionType.Integer,
                    description:
                        "The amount of player slots in the room. Defaults to 8.",
                    minValue: 2,
                    maxValue: 20,
                },
            ],
        },
        {
            name: "leave",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Leaves the multiplayer room.",
        },
        {
            name: "join",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Joins a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    description: "The ID of the room.",
                    maxLength: 20,
                },
                {
                    name: "password",
                    type: ApplicationCommandOptionType.String,
                    description: "The password of the room, if any.",
                },
            ],
        },
        {
            name: "kick",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Kicks a player from the multiplayer room.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                    description: "The user to kick.",
                },
                {
                    name: "lockslot",
                    type: ApplicationCommandOptionType.Boolean,
                    description: "Whether to also lock the player's slot.",
                },
            ],
        },
        {
            name: "players",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Lists all players in a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The ID of the room. Defaults to the room in the current channel.",
                },
            ],
        },
        {
            name: "ready",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Toggles the ready state.",
        },
        {
            name: "round",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Round management.",
            options: [
                {
                    name: "forcesubmit",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Forcefully submits the round's result.",
                },
                {
                    name: "start",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Starts a timer until round start.",
                    options: [
                        {
                            name: "duration",
                            type: ApplicationCommandOptionType.Integer,
                            description:
                                "The duration of the timer, in seconds. Defaults to 10.",
                            minValue: 5,
                            maxValue: 10,
                        },
                        {
                            name: "force",
                            type: ApplicationCommandOptionType.Boolean,
                            description:
                                "Whether to forcefully start the round regardless of ready state of all players.",
                        },
                    ],
                },
                {
                    name: "stop",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Stops the ongoing timer in the room.",
                },
            ],
        },
        {
            name: "settings",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Manages settings for the multiplayer room.",
            options: [
                {
                    name: "allowedmods",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets allowed mods to play.",
                    options: [
                        {
                            name: "mods",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The mods to set to. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "forcear",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets the usage rule of force AR.",
                    options: [
                        {
                            name: "allowed",
                            type: ApplicationCommandOptionType.Boolean,
                            description:
                                "Whether to allow the usage of force AR. Defaults to previously picked option or no.",
                        },
                        {
                            name: "minvalue",
                            type: ApplicationCommandOptionType.Number,
                            description:
                                "The lowest allowable force AR value to use. Defaults to previously picked option or 0.",
                            minValue: 0,
                            maxValue: 12.5,
                        },
                        {
                            name: "maxvalue",
                            type: ApplicationCommandOptionType.Number,
                            description:
                                "The highest allowable force AR value to use. Defaults to previously picked option or 12.5.",
                            minValue: 0,
                            maxValue: 12.5,
                        },
                    ],
                },
                {
                    name: "modmultiplier",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Sets a score multiplier for mods that will override the client's built-in score multiplier.",
                    options: [
                        {
                            name: "mods",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            description:
                                "The mods to set the score multiplier to.",
                        },
                        {
                            name: "multiplier",
                            type: ApplicationCommandOptionType.Number,
                            description:
                                "The multiplier. Omit this option to reset all specified mods' multiplier to their default value.",
                            minValue: 0,
                        },
                    ],
                },
                {
                    name: "name",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets the name of the multiplayer room.",
                    options: [
                        {
                            name: "name",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            description: "The name of the room.",
                            maxLength: 50,
                        },
                    ],
                },
                {
                    name: "slotamount",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Sets the amount of player slots in the multiplayer room.",
                    options: [
                        {
                            name: "slotamount",
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            description: "The amount of player slots.",
                            minValue: 2,
                            maxValue: 20,
                        },
                    ],
                },
                {
                    name: "password",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Sets or removes the password required to join the multiplayer room.",
                    options: [
                        {
                            name: "password",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The password to set to. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "requiredmods",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets required mods to play.",
                    options: [
                        {
                            name: "mods",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The mods to set to. Defaults to none.",
                        },
                    ],
                },
                {
                    name: "scoreportion",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Sets the portion of which the maximum score will contribute to ScoreV2, if win condition is ScoreV2.",
                    options: [
                        {
                            name: "value",
                            type: ApplicationCommandOptionType.Number,
                            description:
                                "The value to set the score portion to. Defaults to 0.4.",
                            minValue: 0,
                            maxValue: 1,
                        },
                    ],
                },
                {
                    name: "sliderlock",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Sets the usage rule of in-game 2B slider lock option.",
                    options: [
                        {
                            name: "allow",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true,
                            description:
                                "Whether the option is allowed to be used.",
                        },
                    ],
                },
                {
                    name: "speedmultiplier",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets the custom speed multiplier to use.",
                    options: [
                        {
                            name: "value",
                            type: ApplicationCommandOptionType.Number,
                            description:
                                "The custom speed multiplier value to use. Must be divisible by 0.05. Defaults to 1.",
                            minValue: 0.5,
                            maxValue: 2,
                        },
                    ],
                },
                {
                    name: "teammode",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets the room's team mode.",
                },
                {
                    name: "transferhost",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Transfers host status to a user.",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionType.User,
                            required: true,
                            description: "The user to transfer host status to.",
                        },
                    ],
                },
                {
                    name: "wincondition",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Sets the room's win condition.",
                },
            ],
        },
        {
            name: "spectate",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Toggles spectating state for the room host without having to leave the multiplayer room.",
        },
        {
            name: "statistics",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Displays the statistics of a multiplayer room.",
            options: [
                {
                    name: "id",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The ID of the room. If omitted, defaults to the current channel's multiplayer room.",
                },
            ],
        },
        {
            name: "team",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Manages teams for a multiplayer room.",
            options: [
                {
                    name: "select",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Moves to a team.",
                    options: [
                        {
                            name: "team",
                            type: ApplicationCommandOptionType.Integer,
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
                    type: ApplicationCommandOptionType.Subcommand,
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
