import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    if (interaction.options.getSubcommandGroup(false)) {
        CommandHelper.runSubcommandGroup(interaction);
    } else {
        CommandHelper.runSubcommandFromInteraction(interaction);
    }
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "daily",
    description: "Main command for daily and weekly challenges.",
    options: [
        {
            name: "about",
            type: CommandArgumentType.SUB_COMMAND,
            description: "All you need to know about daily and weekly challenges!"
        },
        {
            name: "check",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks the current ongoing challenge.",
            options: [
                {
                    name: "type",
                    type: CommandArgumentType.STRING,
                    description: "The type of the challenge. Defaults to daily.",
                    choices: [
                        {
                            name: "Daily",
                            value: "daily"
                        },
                        {
                            name: "Weekly",
                            value: "weekly"
                        }
                    ]
                }
            ]
        },
        {
            name: "checksubmit",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Checks if an osu!droid account or Discord user has completed a challenge.",
            options: [
                {
                    name: "uid",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks if an osu!droid account has completed a challenge using its uid.",
                    options: [
                        {
                            name: "challengeid",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The ID of the challenge."
                        },
                        {
                            name: "uid",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The uid of the osu!droid account."
                        }
                    ]
                },
                {
                    name: "username",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks if an osu!droid account has completed a challenge using its username.",
                    options: [
                        {
                            name: "challengeid",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The ID of the challenge."
                        },
                        {
                            name: "username",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The username the osu!droid account."
                        }
                    ]
                },
                {
                    name: "user",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks if a Discord user has completed a challenge.",
                    options: [
                        {
                            name: "challengeid",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The ID of the challenge."
                        },
                        {
                            name: "user",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The Discord user."
                        }
                    ]
                },
                {
                    name: "self",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks your currently binded osu!droid account's challenge profile.",
                    options: [
                        {
                            name: "challengeid",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The ID of the challenge."
                        }
                    ]
                }
            ]
        },
        {
            name: "challenges",
            type: CommandArgumentType.SUB_COMMAND,
            description: "View challenges for the current ongoing challenge.",
            options: [
                {
                    name: "type",
                    type: CommandArgumentType.STRING,
                    description: "The type of the challenge. Defaults to daily.",
                    choices: [
                        {
                            name: "Daily",
                            value: "daily"
                        },
                        {
                            name: "Weekly",
                            value: "weekly"
                        }
                    ]
                }
            ]
        },
        {
            name: "leaderboard",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views daily and weekly challenges leaderboard.",
            options: [
                {
                    name: "page",
                    type: CommandArgumentType.INTEGER,
                    description: "The page to view. Defaults to 1."
                }
            ]
        },
        {
            name: "manualsubmit",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Manually submits a replay towards the current ongoing challenge.",
            options: [
                {
                    name: "replayurl",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The download URL to the replay."
                }
            ]
        },
        {
            name: "profile",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Checks an osu!droid account's challenge profile.",
            options: [
                {
                    name: "uid",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks an osu!droid account's challenge profile using its uid.",
                    options: [
                        {
                            name: "uid",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The uid of the osu!droid account."
                        }
                    ]
                },
                {
                    name: "username",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks an osu!droid account's challenge profile using its username.",
                    options: [
                        {
                            name: "username",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The username the osu!droid account."
                        }
                    ]
                },
                {
                    name: "user",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks a Discord user's challenge profile.",
                    options: [
                        {
                            name: "user",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The Discord user."
                        }
                    ]
                },
                {
                    name: "self",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks your currently binded osu!droid account's challenge profile."
                }
            ]
        },
        {
            name: "start",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Starts a challenge.",
            options: [
                {
                    name: "challengeid",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The ID of the challenge."
                }
            ]
        },
        {
            name: "submit",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Submits your 50 most recent plays towards the current ongoing challenge.",
            options: [
                {
                    name: "type",
                    type: CommandArgumentType.STRING,
                    description: "The type of the challenge. Defaults to daily.",
                    choices: [
                        {
                            name: "Daily",
                            value: "daily"
                        },
                        {
                            name: "Weekly",
                            value: "weekly"
                        }
                    ]
                }
            ]
        }
    ],
    example: [
        {
            command: "daily submit",
            description: "will submit your 50 most recent plays towards the current ongoing daily challenge."
        },
        {
            command: "daily checksubmit self d21",
            description: "will check if you have played challenge `d21`."
        }
    ],
    permissions: [],
    cooldown: 5,
    scope: "GUILD_CHANNEL"
};