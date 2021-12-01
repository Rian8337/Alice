import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "userbind",
    description:
        "Main command for binding osu!droid accounts to Discord accounts.",
    options: [
        {
            name: "uid",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Switches your currently binded osu!droid account or binds an osu!droid account using its uid.",
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
            name: "username",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Switches your currently binded osu!droid account or binds an osu!droid account using its username.",
            options: [
                {
                    name: "username",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username of the osu!droid account.",
                },
            ],
        },
        {
            name: "verifymap",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Gets the beatmap needed for account verification.",
        },
    ],
    example: [
        {
            command: "userbind uid",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
            ],
            description:
                "will bind your Discord account to the osu!droid account with uid 51076.",
        },
        {
            command: "userbind username",
            arguments: [
                {
                    name: "username",
                    value: "NeroYuki",
                },
            ],
            description:
                "will bind your Discord account to the osu!droid account with username NeroYuki.",
        },
    ],
    cooldown: 5,
    permissions: [],
    scope: "ALL",
};
