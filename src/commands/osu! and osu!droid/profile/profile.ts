import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandGroup(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "profile",
    description: "Main command for osu!droid account profile.",
    options: [
        {
            name: "bindinfo",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "View the bind information of an osu!droid account.",
            options: [
                {
                    name: "uid",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View the bind information of an osu!droid account using its uid.",
                    options: [
                        {
                            name: "uid",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The uid of the osu!droid account."
                        }
                    ]
                },
                {
                    name: "username",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View the bind information of an osu!droid account using its username.",
                    options: [
                        {
                            name: "username",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The username the osu!droid account."
                        }
                    ]
                },
                {
                    name: "user",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View the bind information of a Discord user.",
                    options: [
                        {
                            name: "user",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The Discord user."
                        }
                    ]
                }
            ]
        },
        {
            name: "view",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "View an osu!droid account or Discord user's profile.",
            options: [
                {
                    name: "uid",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View an osu!droid account's profile using its uid.",
                    options: [
                        {
                            name: "uid",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The uid of the osu!droid account."
                        }
                    ]
                },
                {
                    name: "username",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View an osu!droid account's profile using its username.",
                    options: [
                        {
                            name: "username",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The username the osu!droid account."
                        }
                    ]
                },
                {
                    name: "user",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View a Discord user's profile.",
                    options: [
                        {
                            name: "user",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The Discord user."
                        }
                    ]
                },
                {
                    name: "self",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "View your binded osu!droid account's profile."
                }
            ]
        },
        {
            name: "customize",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Customize your profile card.",
            options: [
                {
                    name: "background",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Customize your profile card's background."
                },
                {
                    name: "badge",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Customize your profile card's badge."
                },
                {
                    name: "infobox",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Customize your profile card's information box."
                }
            ]
        }
    ],
    example: [
        {
            command: "profile view",
            description: "will view your currently binded osu!droid account's profile."
        },
        {
            command: "profile bindinfo @Rian8337#0001",
            description: "will view Rian8337's bind information."
        },
        {
            command: "profile view 132783516176875520",
            description: "will view the currently binded osu!droid account's profile of the user with that Discord ID."
        },
        {
            command: "profile bindinfo dgsrz",
            description: "will view the bind information of the osu!droid account with that username."
        },
        {
            command: "profile view 11678",
            description: "will view that uid's profile."
        }
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL"
};