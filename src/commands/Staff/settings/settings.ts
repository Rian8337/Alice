import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "settings",
    description: "Customizes my behavior in a server or channel.",
    options: [
        {
            name: "command",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Customizes settings for commands.",
            options: [
                {
                    name: "cooldown",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the cooldown of a command.",
                    options: [
                        {
                            name: "command",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The command to set the cooldown for.",
                        },
                        {
                            name: "duration",
                            required: true,
                            type: ApplicationCommandOptionTypes.NUMBER,
                            description:
                                "The duration of the cooldown in seconds, ranging from 5 to 3600.",
                            minValue: 5,
                            maxValue: 3600,
                        },
                        {
                            name: "scope",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The scope at which to disable the command. Defaults to channel.",
                            choices: [
                                {
                                    name: "Channel",
                                    value: "channel",
                                },
                                {
                                    name: "Guild",
                                    value: "guild",
                                },
                                {
                                    name: "Global",
                                    value: "global",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "disable",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Disables a command.",
                    options: [
                        {
                            name: "command",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The command to disable.",
                        },
                        {
                            name: "scope",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The scope at which to disable the command. Defaults to channel.",
                            choices: [
                                {
                                    name: "Channel",
                                    value: "channel",
                                },
                                {
                                    name: "Guild",
                                    value: "guild",
                                },
                                {
                                    name: "Global",
                                    value: "global",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "enable",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Enables a command.",
                    options: [
                        {
                            name: "command",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The command to enable.",
                        },
                        {
                            name: "scope",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The scope at which to disable the command. Defaults to channel.",
                            choices: [
                                {
                                    name: "Channel",
                                    value: "channel",
                                },
                                {
                                    name: "Guild",
                                    value: "guild",
                                },
                                {
                                    name: "Global",
                                    value: "global",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "globalcooldown",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets a cooldown for all available commands.",
                    options: [
                        {
                            name: "duration",
                            required: true,
                            type: ApplicationCommandOptionTypes.NUMBER,
                            description:
                                "The duration of the cooldown, ranging from 5 to 3600.",
                            minValue: 5,
                            maxValue: 3600,
                        },
                    ],
                },
            ],
        },
        {
            name: "utility",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Customizes settings for event utilities.",
            options: [
                {
                    name: "disable",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Disables an event utility.",
                    options: [
                        {
                            name: "event",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the event.",
                        },
                        {
                            name: "utility",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the utility.",
                        },
                        {
                            name: "scope",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The scope at which to disable the command. Defaults to channel.",
                            choices: [
                                {
                                    name: "Channel",
                                    value: "channel",
                                },
                                {
                                    name: "Guild",
                                    value: "guild",
                                },
                                {
                                    name: "Global",
                                    value: "global",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "enable",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Enables an event utility.",
                    options: [
                        {
                            name: "event",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the event.",
                        },
                        {
                            name: "utility",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the utility.",
                        },
                        {
                            name: "scope",
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The scope at which to disable the command. Defaults to channel.",
                            choices: [
                                {
                                    name: "Channel",
                                    value: "channel",
                                },
                                {
                                    name: "Guild",
                                    value: "guild",
                                },
                                {
                                    name: "Global",
                                    value: "global",
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "list",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Lists all utilities that the bot has.",
                },
            ],
        },
        {
            name: "timeoutpermission",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Customizes timeout permissions in a server.",
            options: [
                {
                    name: "grant",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Grants timeout permission to a role.",
                    options: [
                        {
                            name: "role",
                            required: true,
                            type: ApplicationCommandOptionTypes.ROLE,
                            description:
                                "The role to grant timeout permission to.",
                        },
                        {
                            name: "duration",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "Maximum timeout time, in time format (e.g. 6:01:24:33 or 2d14h55m34s). Use -1 for indefinite time.",
                        },
                    ],
                },
                {
                    name: "revoke",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Revokes timeout permission from a role.",
                    options: [
                        {
                            name: "role",
                            required: true,
                            type: ApplicationCommandOptionTypes.ROLE,
                            description:
                                "The role to revoke timeout permission from.",
                        },
                    ],
                },
                {
                    name: "list",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Lists roles that have timeout permission.",
                },
            ],
        },
        {
            name: "timeoutimmunity",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Customizes timeout immunity settings in a server.",
            options: [
                {
                    name: "grant",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Grants timeout immunity to a role.",
                    options: [
                        {
                            name: "role",
                            required: true,
                            type: ApplicationCommandOptionTypes.ROLE,
                            description:
                                "The role to grant timeout immunity to.",
                        },
                    ],
                },
                {
                    name: "revoke",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Revokes timeout immunity from a role.",
                    options: [
                        {
                            name: "role",
                            required: true,
                            type: ApplicationCommandOptionTypes.ROLE,
                            description:
                                "The role to revoke timeout immunity from.",
                        },
                    ],
                },
                {
                    name: "list",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Lists roles that have timeout immunity.",
                },
            ],
        },
        {
            name: "punishmentlog",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Customizes punishment log channel in a guild.",
            options: [
                {
                    name: "set",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Sets the guild's punishment log channel.",
                    options: [
                        {
                            name: "channel",
                            required: true,
                            type: ApplicationCommandOptionTypes.CHANNEL,
                            description:
                                "The text channel to set as the guild's punishment log channel.",
                        },
                    ],
                },
                {
                    name: "unset",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Unsets the guild's punishment log channel.",
                },
            ],
        },
    ],
    example: [
        {
            command: "settings punishmentlog set",
            arguments: [
                {
                    name: "channel",
                    value: "#channel",
                },
            ],
            description:
                "will set the current guild's punishment log channel to #channel.",
        },
        {
            command: "settings timeoutimmunity grant",
            arguments: [
                {
                    name: "role",
                    value: "@Moderator",
                },
            ],
            description: "will grant timeout immunity for the Moderator role.",
        },
        {
            command: "settings command cooldown",
            arguments: [
                {
                    name: "command",
                    value: "recent",
                },
                {
                    name: "duration",
                    value: "60s",
                },
            ],
            description:
                'will set the cooldown for "recent" command to 60 seconds.',
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
