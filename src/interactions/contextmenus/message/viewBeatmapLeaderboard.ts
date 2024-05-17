import { MessageContextMenuCommand } from "structures/core/MessageContextMenuCommand";
import { ViewBeatmapLeaderboardLocalization } from "@alice-localization/interactions/contextmenus/message/viewBeatmapLeaderboard/ViewBeatmapLeaderboardLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo } from "@rian8337/osu-base";

export const run: MessageContextMenuCommand["run"] = async (_, interaction) => {
    const localization: ViewBeatmapLeaderboardLocalization =
        new ViewBeatmapLeaderboardLocalization(
            CommandHelper.getLocale(interaction),
        );

    const beatmapId: number | null = BeatmapManager.getBeatmapIDFromMessage(
        interaction.targetMessage,
    );

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapId,
        { checkFile: false },
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    ScoreDisplayHelper.showBeatmapLeaderboard(
        interaction,
        beatmapInfo.hash,
        1,
        false,
    );
};

export const config: MessageContextMenuCommand["config"] = {
    name: "View Beatmap Leaderboard",
    replyEphemeral: true,
};
