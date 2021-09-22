import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
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
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks if you, an osu!droid account, or Discord user has completed a challenge.",
            options: [
                {
                    name: "challengeid",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The ID of the challenge."
                },
                {
                    name: "uid",
                    type: CommandArgumentType.INTEGER,
                    description: "The uid of the osu!droid account."
                },
                {
                    name: "username",
                    type: CommandArgumentType.STRING,
                    description: "The username the osu!droid account."
                },
                {
                    name: "user",
                    type: CommandArgumentType.USER,
                    description: "The Discord user."
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
                    description: "The download URL to the replay (.odr file)."
                }
            ]
        },
        {
            name: "profile",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks yours or an osu!droid account's challenge profile.",
            options: [
                {
                    name: "uid",
                    type: CommandArgumentType.INTEGER,
                    description: "The uid of the osu!droid account."
                },
                {
                    name: "username",
                    type: CommandArgumentType.STRING,
                    description: "The username the osu!droid account."
                },
                {
                    name: "user",
                    type: CommandArgumentType.USER,
                    description: "The Discord user."
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
            command: "daily checksubmit",
            arguments: [
                {
                    name: "challengeid",
                    value: "d21"
                }
            ],
            description: "will check if you have played challenge `d21`."
        },
        {
            command: "daily manualsubmit",
            arguments: [
                {
                    name: "replayurl",
                    value: "https://cdn.discordapp.com/attachments/631130003441975297/888432557941739581/e2dc39ca969a739eaa711ebf431ebdda163.odr"
                }
            ],
            description: "will submit the linked replay to be verified against the current daily or weekly challenge."
        },
        {
            command: "daily submit",
            description: "will submit your 50 most recent plays towards the current ongoing daily challenge."
        }
    ],
    permissions: [],
    cooldown: 5,
    scope: "GUILD_CHANNEL"
};