import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "tag",
    description: "Main command for server-specific tags.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Adds a new tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The name of the tag. Must be less than or equal to 30 characters.",
                    maxLength: 30,
                },
                {
                    name: "content",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The content of the tag. Must be less than or equal to 1500 characters.",
                    maxLength: 1500,
                },
            ],
        },
        {
            name: "attach",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Inserts an attachment to a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the tag.",
                    maxLength: 30,
                },
                {
                    name: "attachment",
                    required: true,
                    type: ApplicationCommandOptionType.Attachment,
                    description: "The attachment. Must be less than 8 MB.",
                },
            ],
        },
        {
            name: "delete",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Deletes a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the tag.",
                    maxLength: 30,
                },
            ],
        },
        {
            name: "edit",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Edits a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the tag.",
                    maxLength: 30,
                },
                {
                    name: "content",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The new content of the tag.",
                    maxLength: 1500,
                },
            ],
        },
        {
            name: "info",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Views information of a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the tag.",
                    maxLength: 30,
                },
            ],
        },
        {
            name: "list",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Lists the tags that a user owns.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The Discord user. Defaults to yourself.",
                },
            ],
        },
        {
            name: "move",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Transfers the ownership of tags from a user to someone else.",
            options: [
                {
                    name: "olduser",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to transfer the tags from.",
                },
                {
                    name: "newuser",
                    required: true,
                    type: ApplicationCommandOptionType.User,
                    description: "The user to transfer the tags to.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Views a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the tag.",
                    maxLength: 30,
                },
            ],
        },
        {
            name: "unattach",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Unattaches a tag's attachment.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the tag.",
                },
                {
                    name: "index",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The index of the attachment to unattach.",
                    choices: [
                        {
                            name: "First",
                            value: 1,
                        },
                        {
                            name: "Second",
                            value: 2,
                        },
                        {
                            name: "Third",
                            value: 3,
                        },
                    ],
                },
            ],
        },
    ],
    example: [
        {
            command: "tag add",
            arguments: [
                {
                    name: "name",
                    value: "deni123",
                },
            ],
            description:
                'will add a new empty tag called "deni123" which needs to be edited or given an attachment.',
        },
        {
            command: "tag add",
            arguments: [
                {
                    name: "name",
                    value: "deni123",
                },
                {
                    name: "content",
                    value: "hi",
                },
            ],
            description:
                'will add a new tag called "deni123" with content "hi".',
        },
        {
            command: "tag attach",
            arguments: [
                {
                    name: "name",
                    value: "deni123",
                },
                {
                    name: "url",
                    value: "https://b.ppy.sh/thumb/902745l.jpg",
                },
            ],
            description: 'will attach the given image to the tag "deni123".',
        },
        {
            command: "tag edit",
            arguments: [
                {
                    name: "name",
                    value: "deni123",
                },
                {
                    name: "content",
                    value: "hi",
                },
            ],
            description: 'will edit the tag "deni123"\'s content to "hi".',
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
