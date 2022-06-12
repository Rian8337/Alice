import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
import { TournamentScore } from "@alice-interfaces/tournament/TournamentScore";
import { PoolLocalization } from "@alice-localization/commands/Tournament/pool/PoolLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageAttachment } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: PoolLocalization = new PoolLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const pick: string = interaction.options.getString("pick", true);

    const pool: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            id
        );

    if (!pool) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("poolNotFound")
            ),
        });
    }

    const map: TournamentBeatmap | null = pool.getBeatmapFromPick(pick);

    if (!map) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("mapNotFound")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const scores: TournamentScore[] = await pool.getBeatmapLeaderboard(pick);

    if (scores.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapHasNoScores")
            ),
        });
    }

    let csvString: string =
        'UID,Username,ScoreV2,"Score Portion","Accuracy Portion",ScoreV1,Mods,Combo,Accuracy,300,100,50,Misses,Date\n';

    for (const score of scores) {
        csvString += `${score.score.uid},${score.score.username},${
            score.scoreV2
        },${pool.calculateScorePortionScoreV2(
            pick,
            score.score.score,
            score.score.accuracy.nmiss,
            score.score.mods
        )},${pool.calculateAccuracyPortionScoreV2(
            pick,
            score.score.accuracy.value(),
            score.score.accuracy.nmiss
        )},${score.score.score},${score.score.mods.reduce(
            (a, v) => a + v.acronym,
            ""
        )},${score.score.combo},${(score.score.accuracy.value() * 100).toFixed(
            2
        )},${score.score.accuracy.n300},${score.score.accuracy.n100},${
            score.score.accuracy.n50
        },${score.score.accuracy.nmiss},"${score.score.date.toUTCString()}"\n`;
    }

    const attachment: MessageAttachment = new MessageAttachment(
        Buffer.from(csvString),
        `leaderboard_${map.name}.csv`
    );

    InteractionHelper.reply(interaction, {
        files: [attachment],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
