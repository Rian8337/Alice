import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction, await CommandHelper.getLocale(interaction));
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "fancy",
    description: "Allows managing the permissions of lounge channel.",
    options: [
        {
            name: "lock",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Locks a user from the lounge channel.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user to lock.",
                },
                {
                    name: "duration",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The duration to lock for, in time format (e.g. 6:01:24:33 or 2d14h55m34s). Use -1 to permanent lock.",
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The reason for unlocking the user.",
                },
            ],
        },
        {
            name: "unlock",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Unlocks a user from the lounge channel.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user to unlock.",
                },
                {
                    name: "reason",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The reason for unlocking the user.",
                },
            ],
        },
    ],
    example: [
        {
            command: "fancy lock user:@Rian8337#0001",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will lock Rian8337 from the lounge channel.",
        },
    ],
    permissions: ["BOT_OWNER"],
    replyEphemeral: true,
    scope: "ALL",
};
