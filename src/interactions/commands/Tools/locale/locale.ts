import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: CommandCategory = CommandCategory.tools;

export const config: SlashCommand["config"] = {
    name: "locale",
    description:
        "Main command for organizing locales per-user, channel, or server.",
    options: [
        {
            name: "clear",
            description:
                "Clears yours, the channel, or the server's preferred locale.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "scope",
                    required: true,
                    description: "The scope to clear.",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "Server",
                            value: "server",
                        },
                        {
                            name: "Channel",
                            value: "channel",
                        },
                        {
                            name: "User (yourself)",
                            value: "user",
                        },
                    ],
                },
            ],
        },
        {
            name: "set",
            description:
                "Sets yours, the channel, or the server's preferred locale.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "scope",
                    required: true,
                    description: "The scope to clear.",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "Server",
                            value: "server",
                        },
                        {
                            name: "Channel",
                            value: "channel",
                        },
                        {
                            name: "User (yourself)",
                            value: "user",
                        },
                    ],
                },
            ],
        },
    ],
    example: [],
    permissions: ["Special"],
    scope: "ALL",
};
