import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "namechange",
    description: "Main command for osu!droid name change requests.",
    options: [
        {
            name: "accept",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Accept a name change request (bot owner only).",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
            ],
        },
        {
            name: "cancel",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Cancels your active name change request.",
        },
        {
            name: "deny",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Deny a name change request (bot owner only).",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The reason for denying the name change request.",
                },
            ],
        },
        {
            name: "request",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Request a name change.",
            options: [
                {
                    name: "email",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The email that is connected to your currently binded osu!droid account.",
                },
                {
                    name: "newusername",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The username to be requested. Cannot contain unicode and must be between 2-20 characters.",
                },
            ],
        },
        {
            name: "history",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "View the name change history of an osu!droid account.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View currently active name change requests.",
        },
    ],
    example: [
        {
            command: "namechange request",
            arguments: [
                {
                    name: "email",
                    value: "test123@gmail.com",
                },
                {
                    name: "newusername",
                    value: "deni123",
                },
            ],
            description:
                'will request a name change with new username "deni123".',
        },
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL",
};