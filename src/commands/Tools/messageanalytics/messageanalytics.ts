import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "messageanalytics",
    description: "Main command for message analytics.",
    options: [
        {
            name: "fetch",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Fetches message data for the main server.",
            options: [
                {
                    name: "fromdate",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The UTC-based date to start fetching from, in <year>-<month>-<date> format."
                },
                {
                    name: "untildate",
                    type: CommandArgumentType.STRING,
                    description: "The UTC-based date to stop fetching, in <year>-<month>-<date> format. Defaults to the current time."
                },
                {
                    name: "scope",
                    type: CommandArgumentType.STRING,
                    description: "The scope at which to fetch the message data. Defaults to channel.",
                    choices: [
                        {
                            name: "Channel",
                            value: "channel"
                        },
                        {
                            name: "Server",
                            value: "server"
                        }
                    ]
                }
            ]
        },
        {
            name: "info",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views message analytics for the main server.",
            options: [
                {
                    name: "type",
                    type: CommandArgumentType.STRING,
                    description: "The activity interval type to view. Defaults to overall.",
                    choices: [
                        {
                            name: "Overall",
                            value: "overall"
                        },
                        {
                            name: "Monthly",
                            value: "monthly"
                        },
                        {
                            name: "Weekly",
                            value: "weekly"
                        },
                        {
                            name: "Daily",
                            value: "daily"
                        }
                    ]
                },
                {
                    name: "date",
                    type: CommandArgumentType.STRING,
                    description: "The UTC-based date to view, in <year>-<month>-<date> format. Defaults on the current time."
                }
            ]
        }
    ],
    example: [
        {
            command: "color #ffdd00",
            description: "will show the color with hex code \"#ffdd00\"."
        }
    ],
    permissions: [],
    scope: "GUILD_CHANNEL"
};