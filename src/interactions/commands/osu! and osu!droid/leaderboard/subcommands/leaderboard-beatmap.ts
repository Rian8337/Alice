import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { MapInfo } from "@rian8337/osu-base";
import { LeaderboardLocalization } from "@localization/interactions/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@utils/helpers/ScoreDisplayHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        CommandHelper.getLocale(interaction),
    );

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? "",
    )[0];

    let hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(
        interaction.channelId,
    );

    const page: number = interaction.options.getInteger("page") ?? 1;

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound"),
            ),
        });
    }

    if (!NumberHelper.isPositive(page)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidPage"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    if (beatmapID) {
        const beatmapInfo: MapInfo<false> | null =
            await BeatmapManager.getBeatmap(beatmapID ?? hash, {
                checkFile: false,
            });

        hash = beatmapInfo?.hash;
    }

    if (!hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound"),
            ),
        });
    }

    ScoreDisplayHelper.showBeatmapLeaderboard(interaction, hash, page);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
