import { MapInfo } from "@rian8337/osu-base";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { downloadlinkStrings } from "./downloadlinkStrings";
import { MessageEmbed, MessageOptions } from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";

export const run: Command["run"] = async (_, interaction) => {
    const beatmapHash: string | undefined =
        BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id);

    if (!beatmapHash) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                downloadlinkStrings.noCachedBeatmap
            ),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapHash,
        false
    );

    if (!beatmapInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                downloadlinkStrings.beatmapNotAvailable
            ),
        });
    }

    const embedOptions: MessageOptions =
        EmbedCreator.createBeatmapEmbed(beatmapInfo);

    const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

    embed.spliceFields(0, embed.fields.length);

    interaction.editReply(embedOptions);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "downloadlink",
    description:
        "Grabs the download link of the latest beatmap cache in the channel (if any).",
    options: [],
    example: [
        {
            command: "downloadlink",
            description:
                "will grab the download link of the cached beatmap in the channel (if any).",
        },
        {
            command: "downloadlink",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
            ],
            description:
                "will grab the download link of the beatmap with ID 1884658.",
        },
        {
            command: "downloadlink",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description: "will grab the download link of the linked beatmap.",
        },
        {
            command: "downloadlink",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/b/1884658",
                },
            ],
            description: "will grab the download link of the linked beatmap.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
