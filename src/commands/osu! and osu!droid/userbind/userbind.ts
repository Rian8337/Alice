import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandHelper } from '@alice-utils/helpers/CommandHelper';

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "userbind",
    description: "Main command for binding osu!droid accounts to Discord accounts.",
    options: [
        {
            name: "uid",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Switches your currently binded osu!droid account or binds an osu!droid account using its uid.",
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
            description: "Switches your currently binded osu!droid account or binds an osu!droid account using its username.",
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
            name: "verifymap",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Gets the beatmap needed for account verification."
        }
    ],
    example: [
        {
            command: "userbind uid 51076",
            description: "will bind your Discord account to the osu!droid account with uid 51076."
        },
        {
            command: "userbind username NeroYuki",
            description: "will bind your Discord account to the osu!droid account with username NeroYuki."
        }
    ],
    cooldown: 5,
    permissions: [],
    scope: "ALL"
};