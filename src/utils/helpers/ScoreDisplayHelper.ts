import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { ScoreRank } from "structures/utils/ScoreRank";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import {
    BaseCommandInteraction,
    Collection,
    GuildMember,
    Message,
    MessageEmbed,
    MessageOptions,
    Snowflake,
} from "discord.js";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { NumberHelper } from "./NumberHelper";
import { Language } from "@alice-localization/base/Language";
import { ScoreDisplayHelperLocalization } from "@alice-localization/utils/helpers/ScoreDisplayHelper/ScoreDisplayHelperLocalization";
import { StringHelper } from "./StringHelper";
import { DateTimeFormatHelper } from "./DateTimeFormatHelper";
import { LocaleHelper } from "./LocaleHelper";
import { Symbols } from "@alice-enums/utils/Symbols";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { DifficultyCalculationResult } from "@alice-utils/dpp/DifficultyCalculationResult";
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { DroidBeatmapDifficultyHelper } from "./DroidBeatmapDifficultyHelper";
import { InteractionHelper } from "./InteractionHelper";
import { OsuBeatmapDifficultyHelper } from "./OsuBeatmapDifficultyHelper";
import { ScoreHelper } from "./ScoreHelper";
import { CommandHelper } from "./CommandHelper";

/**
 * A helper for displaying scores to a user.
 */
export abstract class ScoreDisplayHelper {
    /**
     * Shows a player's recent plays.
     *
     * @param interaction The interaction that triggered the command.
     * @param player The player.
     * @returns A message showing the player's recent plays.
     */
    static async showRecentPlays(
        interaction: BaseCommandInteraction,
        player: Player,
        page: number = 1
    ): Promise<Message> {
        const localization: ScoreDisplayHelperLocalization =
            this.getLocalization(await CommandHelper.getLocale(interaction));

        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        page = NumberHelper.clamp(
            page,
            1,
            Math.ceil(player.recentPlays.length / 5)
        );

        embed.setDescription(
            StringHelper.formatString(
                localization.getTranslation("recentPlays"),
                `**${player.username}**`
            )
        );

        const onPageChange: OnButtonPageChange = async (_, page) => {
            for (
                let i = 5 * (page - 1);
                i < Math.min(player.recentPlays.length, 5 + 5 * (page - 1));
                ++i
            ) {
                const score: Score = player.recentPlays[i];

                embed.addField(
                    `${i + 1}. **${BeatmapManager.getRankEmote(
                        <ScoreRank>score.rank
                    )}** | ${score.title} ${score.getCompleteModString()}`,
                    `${score.score.toLocaleString(
                        LocaleHelper.convertToBCP47(localization.language)
                    )} / ${score.combo}x / ${(
                        score.accuracy.value() * 100
                    ).toFixed(2)}% / [${score.accuracy.n300}/${
                        score.accuracy.n100
                    }/${score.accuracy.n50}/${score.accuracy.nmiss}]\n` +
                        `\`${DateTimeFormatHelper.dateToLocaleString(
                            score.date,
                            localization.language
                        )}\``
                );
            }
        };

        return MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [embed] },
            [interaction.user.id],
            page,
            Math.ceil(player.recentPlays.length / 5),
            120,
            onPageChange
        );
    }

    /**
     * Gets the emote ID of a rank.
     *
     * @param rank The rank.
     * @returns The emote ID.
     */
    static getRankEmoteID(rank: ScoreRank): Snowflake {
        switch (rank) {
            case "A":
                return "611559473236148265";
            case "B":
                return "611559473169039413";
            case "C":
                return "611559473328422942";
            case "D":
                return "611559473122639884";
            case "S":
                return "611559473294606336";
            case "X":
                return "611559473492000769";
            case "SH":
                return "611559473361846274";
            case "XH":
                return "611559473479155713";
        }
    }

    /**
     * Displays a beatmap's leaderboard.
     *
     * @param interaction The interaction to display the leaderboard to.
     * @param hash The MD5 hash of the beatmap.
     * @param page The page to view. Defaults to 1.
     * @param cacheBeatmapToChannel Whether to cache the beatmap as the channel's latest beatmap. Defaults to `true`.
     */
    static async showBeatmapLeaderboard(
        interaction: BaseCommandInteraction,
        hash: string,
        page: number = 1,
        cacheBeatmapToChannel: boolean = true
    ): Promise<void> {
        await InteractionHelper.deferReply(interaction);

        const localization: ScoreDisplayHelperLocalization =
            this.getLocalization(await CommandHelper.getLocale(interaction));

        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            hash,
            false
        );

        if (beatmapInfo && cacheBeatmapToChannel) {
            BeatmapManager.setChannelLatestBeatmap(
                interaction.channelId,
                beatmapInfo.hash
            );
        }

        // Leaderboard cache, mapped by page number
        const leaderboardCache: Collection<number, Score[]> = new Collection();

        // Calculation cache, mapped by score ID
        const droidCalculationCache: Collection<
            number,
            PerformanceCalculationResult<
                DroidDifficultyCalculator,
                DroidPerformanceCalculator
            > | null
        > = new Collection();
        const osuCalculationCache: Collection<
            number,
            PerformanceCalculationResult<
                OsuDifficultyCalculator,
                OsuPerformanceCalculator
            > | null
        > = new Collection();

        // Check first page first for score availability
        const firstPageScores: Score[] =
            await ScoreHelper.fetchDroidLeaderboard(beatmapInfo?.hash ?? hash!);

        if (!firstPageScores[0]) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapHasNoScores")
                ),
            });

            return;
        }

        leaderboardCache.set(1, firstPageScores);

        const arrow: Symbols = Symbols.rightArrowSmall;

        const droidDiffCalcHelper: DroidBeatmapDifficultyHelper =
            new DroidBeatmapDifficultyHelper();
        const osuDiffCalcHelper: OsuBeatmapDifficultyHelper =
            new OsuBeatmapDifficultyHelper();

        const getCalculationResult = async (
            score: Score
        ): Promise<
            [
                PerformanceCalculationResult<
                    DroidDifficultyCalculator,
                    DroidPerformanceCalculator
                > | null,
                PerformanceCalculationResult<
                    OsuDifficultyCalculator,
                    OsuPerformanceCalculator
                > | null
            ]
        > => {
            const droidCalcResult: PerformanceCalculationResult<
                DroidDifficultyCalculator,
                DroidPerformanceCalculator
            > | null = beatmapInfo
                ? droidCalculationCache.get(score.scoreID) ??
                  (await droidDiffCalcHelper.calculateScorePerformance(
                      score,
                      false
                  ))
                : null;

            const osuCalcResult: PerformanceCalculationResult<
                OsuDifficultyCalculator,
                OsuPerformanceCalculator
            > | null = beatmapInfo
                ? osuCalculationCache.get(score.scoreID) ??
                  (await osuDiffCalcHelper.calculateScorePerformance(score))
                : null;

            if (!droidCalculationCache.has(score.scoreID)) {
                droidCalculationCache.set(score.scoreID, droidCalcResult);
            }

            if (!osuCalculationCache.has(score.scoreID)) {
                osuCalculationCache.set(score.scoreID, osuCalcResult);
            }

            return [droidCalcResult, osuCalcResult];
        };

        const getScoreDescription = async (score: Score): Promise<string> => {
            const calcResult: [
                PerformanceCalculationResult<
                    DroidDifficultyCalculator,
                    DroidPerformanceCalculator
                > | null,
                PerformanceCalculationResult<
                    OsuDifficultyCalculator,
                    OsuPerformanceCalculator
                > | null
            ] = await getCalculationResult(score);

            return (
                `${arrow} **${BeatmapManager.getRankEmote(
                    <ScoreRank>score.rank
                )}** ${
                    calcResult[0] && calcResult[1]
                        ? `${arrow} **${calcResult[0].result.total.toFixed(
                              2
                          )}DPP | ${calcResult[1].result.total.toFixed(2)}PP**`
                        : ""
                } ${arrow} ${(score.accuracy.value() * 100).toFixed(2)}%\n` +
                `${arrow} ${score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )} ${arrow} ${score.combo}x ${arrow} [${score.accuracy.n300}/${
                    score.accuracy.n100
                }/${score.accuracy.n50}/${score.accuracy.nmiss}]\n` +
                `\`${DateTimeFormatHelper.dateToLocaleString(
                    score.date,
                    localization.language
                )}\``
            );
        };

        const onPageChange: OnButtonPageChange = async (options, page) => {
            const actualPage: number = Math.floor((page - 1) / 20);

            const pageRemainder: number = (page - 1) % 20;

            const scores: Score[] =
                leaderboardCache.get(actualPage) ??
                (await ScoreHelper.fetchDroidLeaderboard(
                    beatmapInfo?.hash ?? hash!,
                    page
                ));

            if (!leaderboardCache.has(actualPage)) {
                leaderboardCache.set(actualPage, scores);
            }

            const noModCalcParams: DifficultyCalculationParameters =
                new DifficultyCalculationParameters();

            const noModDroidCalcResult: DifficultyCalculationResult<DroidDifficultyCalculator> | null =
                beatmapInfo
                    ? await droidDiffCalcHelper.calculateBeatmapDifficulty(
                          beatmapInfo.hash,
                          noModCalcParams
                      )
                    : null;

            const noModOsuCalcResult: DifficultyCalculationResult<OsuDifficultyCalculator> | null =
                beatmapInfo
                    ? await osuDiffCalcHelper.calculateBeatmapDifficulty(
                          beatmapInfo.hash,
                          noModCalcParams
                      )
                    : null;

            const embedOptions: MessageOptions = beatmapInfo
                ? EmbedCreator.createBeatmapEmbed(
                      beatmapInfo,
                      undefined,
                      localization.language
                  )
                : { embeds: [EmbedCreator.createNormalEmbed()] };

            const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

            embed.fields.pop();

            const topScore: Score = leaderboardCache.get(1)![0];

            if (!embed.title) {
                embed.setTitle(topScore.title);
            } else if (noModDroidCalcResult && noModOsuCalcResult) {
                embed.setTitle(
                    embed.title +
                        ` [${noModDroidCalcResult.result.total.toFixed(2)}${
                            Symbols.star
                        } | ${noModOsuCalcResult.result.total.toFixed(2)}${
                            Symbols.star
                        }]`
                );
            }

            embed.addField(
                `**${localization.getTranslation("topScore")}**`,
                `**${topScore.username}${
                    topScore.mods.length > 0
                        ? ` (${topScore.getCompleteModString()})`
                        : ""
                }**\n` + (await getScoreDescription(topScore))
            );

            const displayedScores: Score[] = scores.slice(
                5 * pageRemainder,
                5 + 5 * pageRemainder
            );

            let i = 20 * actualPage + 5 * pageRemainder;

            for (const score of displayedScores) {
                embed.addField(
                    `**#${++i} ${score.username}${
                        score.mods.length > 0
                            ? ` (${score.getCompleteModString()})`
                            : ""
                    }**`,
                    await getScoreDescription(score)
                );
            }

            Object.assign(options, embedOptions);
        };

        MessageButtonCreator.createLimitlessButtonBasedPaging(
            interaction,
            {},
            [interaction.user.id],
            page,
            120,
            onPageChange
        );
    }

    /**
     * Gets the localization of this helper utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): ScoreDisplayHelperLocalization {
        return new ScoreDisplayHelperLocalization(language);
    }
}
