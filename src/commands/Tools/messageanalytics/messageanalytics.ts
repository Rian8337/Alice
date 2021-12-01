import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
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
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Fetches message data for the main server.",
            options: [
                {
                    name: "fromdate",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The UTC-based date to start fetching from, in <year>-<month>-<date> format.",
                },
                {
                    name: "untildate",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The UTC-based date to stop fetching, in <year>-<month>-<date> format. Defaults to the current time.",
                },
                {
                    name: "scope",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The scope at which to fetch the message data. Defaults to channel.",
                    choices: [
                        {
                            name: "Channel",
                            value: "channel",
                        },
                        {
                            name: "Server",
                            value: "server",
                        },
                    ],
                },
            ],
        },
        {
            name: "info",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Views message analytics for the main server.",
            options: [
                {
                    name: "type",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The activity interval type to view. Defaults to overall.",
                    choices: [
                        {
                            name: "Overall",
                            value: "overall",
                        },
                        {
                            name: "Monthly",
                            value: "monthly",
                        },
                        {
                            name: "Weekly",
                            value: "weekly",
                        },
                        {
                            name: "Daily",
                            value: "daily",
                        },
                    ],
                },
                {
                    name: "date",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The UTC-based date to view, in <year>-<month>-<date> format. Defaults on the current time.",
                },
            ],
        },
    ],
    example: [
        {
            command: "messageanalytics fetch",
            arguments: [
                {
                    name: "fromdate",
                    value: "2018-1-1",
                },
                {
                    name: "scope",
                    value: "Server",
                },
            ],
            description:
                "will fetch message analytics from January 1st, 2018 up to this date.",
        },
        {
            command: "messageanalytics info type:Daily date:2019-1-1",
            arguments: [
                {
                    name: "type",
                    value: "Daily",
                },
                {
                    name: "date",
                    value: "2019-1-1",
                },
            ],
            description:
                "will give message analytics information in January 1st, 2019.",
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
