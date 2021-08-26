import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "recent5",
    description: "Displays the 50 most recent plays of a player.",
    options: [
        {
            name: "user",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Displays the 50 most recent plays of a player.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The Discord user to show."
                }
            ]
        },
        {
            name: "uid",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Displays the 50 most recent plays of an osu!droid account from its uid.",
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
            description: "Displays the 50 most recent plays of an osu!droid from its username.",
            options: [
                {
                    name: "username",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The username of the osu!droid account."
                }
            ]
        },
        {
            name: "self",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Displays your 50 most recent plays."
        }
    ],
    example: [
        {
            command: "recent5 self",
            description: "will display your 50 most recent plays."
        },
        {
            command: "recent5 uid 51076",
            description: "will display the 50 most recent plays of an osu!droid account with uid 51076."
        },
        {
            command: "recent5 username NeroYuki",
            description: "will display the 50 most recent plays of an osu!droid account with username NeroYuki."
        },
        {
            command: "recent5 user @Rian8337#0001",
            description: "will display the 50 most recent plays of Rian8337."
        }
    ],
    permissions: [],
    scope: "ALL"
};