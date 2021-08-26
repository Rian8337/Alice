import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "vote",
    description: "Main voting command.",
    options: [
        {
            name: "check",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks the ongoing vote in the channel."
        },
        {
            name: "end",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Ends the ongoing vote in the channel. Only the initiator and users with \"Manage Channels\" permission can end a vote."
        },
        {
            name: "contribute",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Contributes to the ongoing vote.",
            options: [
                {
                    name: "option",
                    type: CommandArgumentType.INTEGER,
                    required: true,
                    description: "The option to vote for."
                }
            ]
        },
        {
            name: "start",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Starts a vote in the channel.",
            options: [
                {
                    name: "input",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The input to start vote, defined as \"<topic> | <choice 1> | <choice 2> | <choice n> | ...\""
                }
            ]
        }
    ],
    example: [
        {
            command: "vote start What is your favorite color? | Green | Blue | Red",
            description: "will start a vote in the channel with topic \"What is your favorite color?\" and choices \"Green\", \"Blue\", and \"Red\"."
        },
        {
            command: "vote contribute 2",
            description: "will vote for option 2 in the current ongoing vote in the channel."
        }
    ],
    cooldown: 10,
    permissions: [],
    scope: "GUILD_CHANNEL"
};