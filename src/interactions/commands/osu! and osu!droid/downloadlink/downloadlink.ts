import { MapInfo } from "@rian8337/osu-base";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { EmbedBuilder, BaseMessageOptions } from "discord.js";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { DownloadlinkLocalization } from "@localization/interactions/commands/osu! and osu!droid/downloadlink/DownloadlinkLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: DownloadlinkLocalization = new DownloadlinkLocalization(
        CommandHelper.getLocale(interaction),
    );

    const beatmapHash: string | undefined =
        BeatmapManager.getChannelLatestBeatmap(interaction.channelId);

    if (!beatmapHash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmap"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapHash,
        { checkFile: false },
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotAvailable"),
            ),
        });
    }

    const embedOptions: BaseMessageOptions = EmbedCreator.createBeatmapEmbed(
        beatmapInfo,
        undefined,
        localization.language,
    );

    const embed: EmbedBuilder = EmbedBuilder.from(embedOptions.embeds![0]);

    embed.spliceFields(0, embed.data.fields!.length);

    InteractionHelper.reply(interaction, embedOptions);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
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
};
