import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: CommandCategory = CommandCategory.STAFF;

export const config: SlashCommand["config"] = {
    name: "warning",
    description:
        "A warning system. Anyone with timeout permission can use this system.",
    options: [
        {
            name: "issue",
            description: "Issues a warning to a user.",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to give the warning to.",
                },
                {
                    name: "validduration",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The duration this warning will stay valid, in time format (e.g. 6:01:24:33 or 2d14h55m34s). Min 3h.",
                },
                {
                    name: "points",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The amount of warning points to be issued to the user, from 1 to 10.",
                    minValue: 1,
                    maxValue: 10,
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The reason for warning the user. Maximum length is 1500 characters.",
                },
            ],
        },
        {
            name: "list",
            description: "Lists the warning of a user in the current server.",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description:
                        "The user to list the warning. Defaults to yourself.",
                },
            ],
        },
        {
            name: "transfer",
            description:
                "Transfers a user's warnings into another user in the current server.",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "from",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to transfer warnings from.",
                },
                {
                    name: "to",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The user to transfer warnings to.",
                },
                {
                    name: "reason",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The reason for transferring warnings.",
                },
            ],
        },
        {
            name: "unissue",
            description:
                "Unissues a warning from a user in the current server.",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The ID of the warning.",
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The reason for unissuing the warning.",
                },
            ],
        },
        {
            name: "view",
            description: "Views a warning in the current server.",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "id",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The ID of the warning.",
                },
            ],
        },
    ],
    example: [],
    permissions: ["SPECIAL"],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL",
};
