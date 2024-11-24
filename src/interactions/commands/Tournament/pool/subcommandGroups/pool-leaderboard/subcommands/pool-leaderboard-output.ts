import { DatabaseManager } from "@database/DatabaseManager";
import { TournamentMappool } from "@database/utils/elainaDb/TournamentMappool";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TournamentBeatmap } from "structures/tournament/TournamentBeatmap";
import { TournamentScore } from "@structures/tournament/TournamentScore";
import { PoolLocalization } from "@localization/interactions/commands/Tournament/pool/PoolLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { AttachmentBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: PoolLocalization = new PoolLocalization(
        CommandHelper.getLocale(interaction),
    );

    const id: string = interaction.options.getString("id", true);

    const pick: string = interaction.options.getString("pick", true);

    const pool: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            id,
        );

    if (!pool) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("poolNotFound"),
            ),
        });
    }

    const map: TournamentBeatmap | null = pool.getBeatmapFromPick(pick);

    if (!map) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("mapNotFound"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const scores: TournamentScore[] = await pool.getBeatmapLeaderboard(pick);

    if (scores.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapHasNoScores"),
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
            score.score.mods,
        )},${pool.calculateAccuracyPortionScoreV2(
            pick,
            score.score.accuracy.value(),
            score.score.accuracy.nmiss,
            score.score.mods,
        )},${score.score.score},${score.score.mods.reduce(
            (a, v) => a + v.acronym,
            "",
        )},${score.score.combo},${(score.score.accuracy.value() * 100).toFixed(
            2,
        )},${score.score.accuracy.n300},${score.score.accuracy.n100},${
            score.score.accuracy.n50
        },${score.score.accuracy.nmiss},"${score.score.date.toUTCString()}"\n`;
    }

    const attachment: AttachmentBuilder = new AttachmentBuilder(
        Buffer.from(csvString),
        { name: `leaderboard_${map.name}.csv` },
    );

    InteractionHelper.reply(interaction, {
        files: [attachment],
    });
};
