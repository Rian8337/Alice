import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "recalc",
    description: "The main command for droid performance points (dpp) recalculation system.",
    options: [
        {
            name: "all",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Recalculates all users in the droid performance points (dpp) system.",
            options: [
                {
                    name: "full",
                    type: CommandArgumentType.BOOLEAN,
                    description: "Whether to consider all plays or only top 75 submitted plays."
                }
            ]
        },
        {
            name: "prototype",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Recalculates a user as prototype droid performance points (dpp).",
            options: [
                {
                    name: "user",
                    type: CommandArgumentType.USER,
                    description: "The user to recalculate."
                },
                {
                    name: "uid",
                    type: CommandArgumentType.INTEGER,
                    description: "The uid of the user."
                },
                {
                    name: "username",
                    type: CommandArgumentType.STRING,
                    description: "The username of the user."
                }
            ]
        },
        {
            name: "user",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Recalculates all scores of a user.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to recalculate."
                }
            ]
        }
    ],
    example: [
        {
            command: "recalc all true",
            description: "will recalculate all scores of all users in the droid performance points (dpp) system."
        },
        {
            command: "recalc user @Rian8337#0001",
            description: "will recalculate Rian8337's scores."
        },
        {
            command: "recalc user 132783516176875520",
            description: "will recalculate the scores of the user with that Discord ID."
        }
    ],
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL"
};