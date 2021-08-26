import { Config } from "@alice-core/Config";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { submitStrings } from "./submitStrings";

export const run: Command["run"] = async (_, interaction) => {
    if (!CommandHelper.isExecutedByBotOwner(interaction) && !Config.ppChannel.includes(interaction.channel!.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                submitStrings.commandNotAllowed)
        }).then(
            () => setTimeout(interaction.deleteReply, 5 * 1000)
        );
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "submit",
    description: "Submits one or more score(s) the droid pp and ranked score system.",
    options: [
        {
            name: "beatmap",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Submit a score from a beatmap.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The beatmap ID or link."
                }
            ]
        },
        {
            name: "recent",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Submit score(s) from your recent plays.",
            options: [
                {
                    name: "amount",
                    type: CommandArgumentType.INTEGER,
                    description: "The amount of score(s) to submit, ranging from 1 to 5. Defaults to 1."
                },
                {
                    name: "offset",
                    type: CommandArgumentType.INTEGER,
                    description: "The index offset in your recent play list that you want to start submitting, ranging from 1 to 50. Defaults to 1."
                }
            ]
        }
    ],
    example: [
        {
            command: "submit recent",
            description: "will submit your most recent play."
        },
        {
            command: "submit recent 3",
            description: "will submit your 1st, 2nd, and 3rd most recent plays."
        },
        {
            command: "submit recent 4 18",
            description: "will submit your 18th, 19th, 20th, and 21th most recent plays."
        },
        {
            command: "submit beatmap https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
            description: "will submit your score from the linked beatmap."
        },
        {
            command: "submit beatmap 1884658",
            description: "will submit your score from the beatmap with that ID."
        }
    ],
    permissions: [],
    cooldown: 10,
    scope: "GUILD_CHANNEL"
};