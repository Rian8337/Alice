import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";

export const run: Command["run"] = async (_, interaction) => {
    
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "mapshare",
    description: "Main command for map sharing.",
    options: [
        {
            name: "accept",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Accepts a map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link that the submission is sharing."
                }
            ]
        },
        {
            name: "ban",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Bans a user from submitting a map share submission.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to ban."
                }
            ]
        },
        {
            name: "deny",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Denies a map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link that the submission is sharing."
                }
            ]
        },
        {
            name: "list",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Lists all map sharing submissions with the specified status.",
            options: [
                {
                    name: "status",
                    type: CommandArgumentType.STRING,
                    description: "The status of submissions to list. Defaults to pending.",
                    choices: [
                        {
                            name: "Accepted",
                            value: "accepted"
                        },
                        {
                            name: "Denied",
                            value: "denied"
                        },
                        {
                            name: "Pending",
                            value: "pending"
                        },
                        {
                            name: "Posted",
                            value: "posted"
                        }
                    ]
                },
                {
                    name: "page",
                    type: CommandArgumentType.INTEGER,
                    description: "The page to view. Defaults to 1."
                }
            ]
        },
        {
            name: "post",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Posts a map sharing submission to the map share channel.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link that the submission is sharing."
                }
            ]
        },
        {
            name: "submit",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Submits a new map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link to share.."
                },
                {
                    name: "summary",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The summary of the beatmap to share. Must be between 50-120 words and 100-900 characters."
                }
            ]
        },
        {
            name: "unban",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Unbans a user from submitting a map share submission.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to unban."
                }
            ]
        },
        {
            name: "view",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views a map sharing submission.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link that the submission is sharing."
                }
            ]
        }
    ],
    example: [
        {
            command: "mapshare submit https://osu.ppy.sh/beatmapsets/902745#osu/1884658 this map is so good",
            description: "will submit a new map sharing submission with the linked beatmap and summary \"this map is so good\"."
        },
        {
            command: "leaderboard ranked 3",
            description: "will view the ranked score leaderboard at page 3."
        },
        {
            command: "leaderboard dpp 1 Sunda Empire",
            description: "will view the ranked score leaderboard at page 1 for the \"Sunda Empire\" clan."
        }
    ],
    permissions: [],
    scope: "GUILD_CHANNEL"
};