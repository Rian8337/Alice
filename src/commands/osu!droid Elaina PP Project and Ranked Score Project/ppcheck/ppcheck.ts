import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "ppcheck",
    description: "Checks a user's droid pp (dpp) profile.",
    options: [
        {
            name: "user",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks a user's droid pp (dpp) profile.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to check."
                },
                {
                    name: "page",
                    type: CommandArgumentType.INTEGER,
                    description: "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Default is 1."
                }
            ]
        },
        {
            name: "uid",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks the droid pp profile of an osu!droid account using its uid.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: CommandArgumentType.INTEGER,
                    description: "The uid to check."
                },
                {
                    name: "page",
                    type: CommandArgumentType.INTEGER,
                    description: "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Default is 1."
                }
            ]
        },
        {
            name: "username",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks the droid pp (dpp) profile of an osu!droid account using its username.",
            options: [
                {
                    name: "username",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The username to check."
                },
                {
                    name: "page",
                    type: CommandArgumentType.INTEGER,
                    description: "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Default is 1."
                }
            ]
        },
        {
            name: "self",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks your droid pp (dpp) profile."
        }
    ],
    example: [
        {
            command: "ppcheck",
            description: "will give a list of your submitted plays in droid pp system."
        },
        {
            command: "ppcheck @Rian8337#0001 5",
            description: "will give a list of Rian8337's submitted plays in droid pp system at page 5."
        },
        {
            command: "ppcheck 132783516176875520",
            description: "will give a list of the user with that Discord ID's submitted plays in droid pp system."
        },
        {
            command: "ppcheck dgsrz 7",
            description: "will give a list of that username's submitted plays in droid pp system at page 7."
        },
        {
            command: "ppcheck 11678",
            description: "will give a list of that uid's submitted plays in droid pp system."
        }
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL"
};