import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
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
            type: ApplicationCommandOptionType.Subcommand,
            description: "Accept a name change request (bot owner only).",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the osu!droid account.",
                    minValue: 0,
                },
            ],
        },
        {
            name: "cancel",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Cancels an active name change request.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the osu!droid account.",
                    minValue: 0,
                },
            ],
        },
        {
            name: "deny",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Deny a name change request (bot owner only).",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the osu!droid account.",
                    minValue: 0,
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The reason for denying the name change request.",
                },
            ],
        },
        {
            name: "request",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Request a name change.",
            options: [
                {
                    name: "email",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The email that is connected to your currently binded osu!droid account.",
                },
                {
                    name: "newusername",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The username to be requested. Cannot contain unicode characters.",
                    minLength: 2,
                    maxLength: 20,
                },
            ],
        },
        {
            name: "history",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "View the name change history of an osu!droid account.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the osu!droid account.",
                    minValue: 0,
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionType.Subcommand,
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
