import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.BOT_CREATORS;

export const config: SlashCommand["config"] = {
    name: "tag",
    description: "Main command for server-specific tags.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Adds a new tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The name of the tag. Must be less than or equal to 30 characters.",
                },
                {
                    name: "content",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The content of the tag. Must be less than or equal to 1500 characters.",
                },
            ],
        },
        {
            name: "attach",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Inserts an attachment to a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the tag.",
                },
                {
                    name: "attachment",
                    required: true,
                    type: ApplicationCommandOptionTypes.ATTACHMENT,
                    description: "The attachment. Must be less than 8 MB.",
                },
            ],
        },
        {
            name: "delete",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Deletes a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the tag.",
                },
            ],
        },
        {
            name: "edit",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Edits a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the tag.",
                },
                {
                    name: "content",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The new content of the tag.",
                },
            ],
        },
        {
            name: "info",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Views information of a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the tag.",
                },
            ],
        },
        {
            name: "list",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Lists the tags that a user owns.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user. Defaults to yourself.",
                },
            ],
        },
        {
            name: "move",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Transfers the ownership of tags from a user to someone else.",
            options: [
                {
                    name: "olduser",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to transfer the tags from.",
                },
                {
                    name: "newuser",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to transfer the tags to.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Views a tag.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the tag.",
                },
            ],
        },
        {
            name: "unattach",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Unattaches a tag's attachment.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The name of the tag.",
                },
                {
                    name: "index",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
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
