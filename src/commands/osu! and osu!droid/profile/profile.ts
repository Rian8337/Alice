import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandOrGroup(
        interaction,
        await CommandHelper.getLocale(interaction)
    );
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "profile",
    description: "Main command for osu!droid account profile.",
    options: [
        {
            name: "bindinfo",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "View your bind information or an osu!droid account.",
            options: [
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username the osu!droid account.",
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user.",
                },
            ],
        },
        {
            name: "view",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "View your osu!droid account's profile or someone else's.",
            options: [
                {
                    name: "uid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid of the osu!droid account.",
                },
                {
                    name: "username",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username the osu!droid account.",
                },
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user.",
                },
                {
                    name: "type",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The type of the profile to show. Defaults to simplified.",
                    choices: [
                        {
                            name: "Simplified Profile",
                            value: "simplified",
                        },
                        {
                            name: "Detailed Profile",
                            value: "detailed",
                        },
                    ],
                },
            ],
        },
        {
            name: "customize",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Customize your profile card.",
            options: [
                {
                    name: "background",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Customize your profile card's background.",
                },
                {
                    name: "badge",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Customize your profile card's badge.",
                },
                {
                    name: "infobox",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Customize your profile card's information box.",
                },
            ],
        },
    ],
    example: [
        {
            command: "profile view",
            description:
                "will view your currently binded osu!droid account's profile.",
        },
        {
            command: "profile bindinfo",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will view Rian8337's bind information.",
        },
        {
            command: "profile view",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will view the currently binded osu!droid account's profile of the user with that Discord ID.",
        },
        {
            command: "profile bindinfo",
            arguments: [
                {
                    name: "username",
                    value: "dgsrz",
                },
            ],
            description:
                "will view the bind information of the osu!droid account with that username.",
        },
        {
            command: "profile view",
            arguments: [
                {
                    name: "uid",
                    value: 11678,
                },
            ],
            description: "will view that uid's profile.",
        },
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL",
};
