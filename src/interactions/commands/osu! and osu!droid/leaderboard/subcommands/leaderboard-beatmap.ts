import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo } from "@rian8337/osu-base";
import { LeaderboardLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? ""
    )[0];

    let hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(
        interaction.channelId
    );

    const page: number = interaction.options.getInteger("page") ?? 1;

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound")
            ),
        });
    }

    if (!NumberHelper.isPositive(page)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidPage")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID ?? hash,
        false
    );

    hash ??= beatmapInfo?.hash;

    if (!hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound")
            ),
        });
    }

    ScoreDisplayHelper.showBeatmapLeaderboard(interaction, hash, page);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
