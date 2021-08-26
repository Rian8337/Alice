import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { compareStrings } from "./compareStrings";

export const run: Command["run"] = async (_, interaction) => {
    const cachedBeatmapHash: string | undefined = BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id);

    if (!cachedBeatmapHash) {
        return interaction.editReply({
            content: MessageCreator.createReject(compareStrings.noCachedBeatmap)
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "compare",
    description: "Compares a player's score among others.",
    options: [
        {
            name: "user",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Compares a Discord user's score among others.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The Discord user to compare."
                }
            ]
        },
        {
            name: "uid",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Compares an osu!droid account's score among others from its uid.",
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
            description: "Compares an osu!droid account's score among others from its username.",
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
            description: "Compares your score among others."
        }
    ],
    example: [
        {
            command: "compare self",
            description: "will compare your score among others."
        },
        {
            command: "compare uid 51076",
            description: "will compare the score of an osu!droid account with uid 51076."
        },
        {
            command: "compare username NeroYuki",
            description: "will compare the score of an osu!droid account with username NeroYuki."
        },
        {
            command: "compare user @Rian8337#0001",
            description: "will compare the score of Rian8337."
        }
    ],
    permissions: [],
    scope: "ALL"
};