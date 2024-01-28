import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionType } from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction),
    );
};

export const category: SlashCommand["category"] = CommandCategory.general;

export const config: SlashCommand["config"] = {
    name: "ticket",
    description: "Primary interface of the ticket system.",
    options: [
        {
            name: "close",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Closes a ticket.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                    description: "The ID of the ticket.",
                },
            ],
        },
        {
            name: "create",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Creates a new ticket.",
        },
        {
            name: "edit",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Edits a ticket.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                    description: "The ID of the ticket.",
                },
            ],
        },
        {
            name: "reopen",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Reopens a ticket.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                    description: "The ID of the ticket.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Views a ticket.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                    description: "The ID of the ticket.",
                },
            ],
        },
    ],
    example: [],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
