import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { ScoreRank } from "@alice-types/utils/ScoreRank";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Collection, MessageEmbed, MessageOptions } from "discord.js";
import { DroidAPIRequestBuilder, MapInfo, RequestResponse, Score } from "osu-droid";
import { leaderboardStrings } from "../leaderboardStrings";

/**
 * Fetches leaderboard for beatmaps that are not available in osu! beatmap listing.
 * 
 * @param hash The MD5 hash of the beatmap.
 * @param page The page to fetch.
 * @returns The scores in the page.
 */
async function fetchLeaderboard(hash: string, page: number): Promise<Score[]> {
    const apiRequestBuilder: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
        .setEndpoint("scoresearchv2.php")
        .addParameter("hash", hash)
        .addParameter("page", page - 1)
        .addParameter("order", "score");

    const result: RequestResponse = await apiRequestBuilder.sendRequest();
    if (result.statusCode !== 200) {
        return [];
    }

    const data: string[] = result.data.toString("utf-8").split("<br>");
    data.shift();

    return data.map(v => new Score().fillInformation(v));
}

export const run: Subcommand["run"] = async (_, interaction) => {
    const beatmapID: number = BeatmapManager.getBeatmapID(interaction.options.getString("beatmap") ?? "")[0];

    const hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id);

    const page: number = interaction.options.getInteger("page") ?? 1;

    if (!beatmapID && !hash) {
        return interaction.editReply({
            content: MessageCreator.createReject(leaderboardStrings.noBeatmapFound)
        });
    }

    if (!NumberHelper.isPositive(page)) {
        return interaction.editReply({
            content: MessageCreator.createReject(leaderboardStrings.invalidPage)
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(beatmapID ?? hash, false);

    if (beatmapInfo) {
        BeatmapManager.setChannelLatestBeatmap(interaction.channelId, beatmapInfo.hash);
    }

    // Leaderboard cache, mapped by page number
    const leaderboardCache: Collection<number, Score[]> = new Collection();

    // Calculation cache, mapped by score
    const calculationCache: Collection<Score, PerformanceCalculationResult | null> = new Collection();

    // Check first page first for score availability
    const firstPageScores: Score[] = await (beatmapInfo?.fetchDroidLeaderboard(1) ?? fetchLeaderboard(<string> hash, page));

    if (!firstPageScores[0]) {
        return interaction.editReply({
            content: MessageCreator.createReject(leaderboardStrings.beatmapHasNoScores)
        });
    }

    leaderboardCache.set(1, firstPageScores);

    const arrow: Symbols = Symbols.rightArrowSmall;

    const getCalculationResult = async (score: Score): Promise<PerformanceCalculationResult | null> => {
        const calcResult: PerformanceCalculationResult | null =
            beatmapInfo ? (
                calculationCache.get(score) ??
                await BeatmapDifficultyHelper.calculateScorePerformance(score, false)
            ) : null;

        if (!calculationCache.has(score)) {
            calculationCache.set(score, calcResult);
        }

        return calcResult;
    };

    const getScoreDescription = async (score: Score): Promise<string> => {
        const calcResult: PerformanceCalculationResult | null = await getCalculationResult(score);

        return `${arrow} **${BeatmapManager.getRankEmote(<ScoreRank> score.rank)}** ${calcResult ? `${arrow} **${calcResult.droid.total.toFixed(2)}DPP | ${calcResult.osu.total.toFixed(2)}PP**` : ""} ${arrow} ${(score.accuracy.value() * 100).toFixed(2)}%\n` +
            `${arrow} ${score.score.toLocaleString()} ${arrow} ${score.combo}x ${arrow} [${score.accuracy.n300}/${score.accuracy.n100}/${score.accuracy.n50}/${score.accuracy.nmiss}]\n` +
            `\`${score.date.toUTCString()}\``;
    };

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const actualPage: number = Math.floor((page - 1) / 20);

        const pageRemainder: number = (page - 1) % 20;

        const scores: Score[] = leaderboardCache.get(actualPage) ?? 
            (beatmapInfo ? await beatmapInfo.fetchDroidLeaderboard(actualPage) : await fetchLeaderboard(hash!, page));

        if (!leaderboardCache.has(actualPage)) {
            leaderboardCache.set(actualPage, scores);
        }

        const noModCalcParams: StarRatingCalculationParameters = new StarRatingCalculationParameters([]);

        const noModCalcResult: StarRatingCalculationResult | null =
            beatmapInfo ?
                await BeatmapDifficultyHelper.calculateBeatmapDifficulty(
                    beatmapInfo.hash, noModCalcParams
                )
                :
                null;

        const embedOptions: MessageOptions = beatmapInfo ?
            EmbedCreator.createBeatmapEmbed(beatmapInfo) : { embeds: [ EmbedCreator.createNormalEmbed() ] };

        const embed: MessageEmbed = <MessageEmbed> embedOptions.embeds![0];

        const topScore: Score = leaderboardCache.get(1)![0];

        if (!embed.title) {
            embed.setTitle(topScore.title);
        } else if (noModCalcResult) {
            embed.setTitle(embed.title + ` [${noModCalcResult.droid.total.toFixed(2)}${Symbols.star} | ${noModCalcResult.osu.total.toFixed(2)}${Symbols.star}]`);
        }

        embed.addField(
            "**Top Score**",
            `**${topScore.username}${topScore.mods.length > 0 ? ` (${topScore.getCompleteModString()})` : ""}**\n` +
            await getScoreDescription(topScore)
        );

        const displayedScores: Score[] = scores.slice(5 * pageRemainder, 5 + 5 * pageRemainder);

        let i = 20 * actualPage + 5 * pageRemainder;

        for await (const score of displayedScores) {
            embed.addField(
                `**#${++i} ${score.username}${score.mods.length > 0 ? ` (${score.getCompleteModString()})` : ""}**`,
                await getScoreDescription(score)
            );
        }

        Object.assign(options, embedOptions);
    };

    MessageButtonCreator.createLimitlessButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        [],
        page,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: []
};