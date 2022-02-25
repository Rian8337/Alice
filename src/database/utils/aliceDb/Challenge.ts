import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Bonus } from "@alice-interfaces/challenge/Bonus";
import { BonusDescription } from "@alice-interfaces/challenge/BonusDescription";
import { PassRequirement } from "@alice-interfaces/challenge/PassRequirement";
import { DatabaseChallenge } from "@alice-interfaces/database/aliceDb/DatabaseChallenge";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BonusID } from "@alice-types/challenge/BonusID";
import { ChallengeStatusType } from "@alice-types/challenge/ChallengeStatusType";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import {
    Collection,
    GuildEmoji,
    MessageOptions,
    Snowflake,
    TextChannel,
} from "discord.js";
import { ObjectId } from "mongodb";
import { Manager } from "@alice-utils/base/Manager";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { UserBind } from "../elainaDb/UserBind";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";
import {
    Accuracy,
    Mod,
    MapInfo,
    ModEasy,
    ModNoFail,
    ModHalfTime,
    MapStats,
    ModUtil,
} from "@rian8337/osu-base";
import {
    DroidPerformanceCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    ReplayAnalyzer,
    ReplayData,
    HitErrorInformation,
} from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { Language } from "@alice-localization/base/Language";
import {
    ChallengeLocalization,
    ChallengeStrings,
} from "@alice-localization/database/utils/aliceDb/ChallengeLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

/**
 * Represents a daily or weekly challenge.
 */
export class Challenge extends Manager {
    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    /**
     * The ID of the challenge.
     */
    challengeid: string;

    /**
     * The ID of the beatmap in the challenge.
     */
    beatmapid: number;

    /**
     * The Discord ID of the user who featured the challenge.
     */
    featured: Snowflake;

    /**
     * The download links to the challenge beatmapset.
     *
     * The first element is the download link via Google Drive,
     * the second element is the download link via OneDrive.
     */
    link: [string, string];

    /**
     * The status of the challenge.
     */
    status: ChallengeStatusType;

    /**
     * The MD5 hash of the challenge beatmapset.
     */
    hash: string;

    /**
     * The mods required to complete this challenge.
     */
    constrain: string;

    /**
     * The amount of points awarded for completing the challenge.
     */
    points: number;

    /**
     * The epoch time at which the challenge will end, in seconds.
     */
    timelimit: number;

    /**
     * The pass condition of the challenge.
     */
    pass: PassRequirement;

    /**
     * The bonuses for the challenge, mapped by their ID.
     */
    bonus: Collection<BonusID, Bonus>;

    /**
     * The type of the challenge.
     */
    get type(): ChallengeType {
        return this.challengeid.startsWith("w") ? "weekly" : "daily";
    }

    /**
     * Whether this challenge is a weekly challenge.
     */
    get isWeekly(): boolean {
        return this.type === "weekly";
    }

    /**
     * Whether the challenge is scheduled.
     */
    get isScheduled(): boolean {
        return this.status === "scheduled";
    }

    /**
     * Whether the challenge is ongoing.
     */
    get isOngoing(): boolean {
        return this.status === "ongoing";
    }

    /**
     * Whether the challenge has finished.
     */
    get hasFinished(): boolean {
        return this.status === "finished";
    }

    private readonly challengeChannelID: Snowflake = "669221772083724318";

    constructor(
        data: DatabaseChallenge = DatabaseManager.aliceDb?.collections.challenge
            .defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.challengeid = data.challengeid;
        this.beatmapid = data.beatmapid;
        this.featured = data.featured || Config.botOwners[1];
        this.link = data.link;
        this.status = data.status;
        this.hash = data.hash;
        this.constrain = data.constrain;
        this.points = data.points;
        this.timelimit = data.timelimit;
        this.pass = data.pass;
        this.bonus = ArrayHelper.arrayToCollection(data.bonus ?? [], "id");
    }

    /**
     * Starts the challenge.
     *
     * @param language The locale of the user who attempted to start the challenge. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async start(language: Language = "en"): Promise<OperationResult> {
        const localization: ChallengeLocalization =
            this.getLocalization(language);

        if (this.status !== "scheduled") {
            return this.createOperationResult(
                false,
                localization.getTranslation("challengeNotFound")
            );
        }

        // Check if any challenges are ongoing
        if (
            await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(
                this.type
            )
        ) {
            return this.createOperationResult(
                false,
                localization.getTranslation("challengeOngoing")
            );
        }

        this.status = "ongoing";

        this.timelimit =
            Math.floor(Date.now() / 1000) + 86400 * (this.isWeekly ? 7 : 1);

        await DatabaseManager.aliceDb.collections.challenge.update(
            { challengeid: this.challengeid },
            {
                $set: {
                    status: "ongoing",
                    timelimit: this.timelimit,
                },
            }
        );

        const notificationChannel: TextChannel = <TextChannel>(
            await this.client.channels.fetch(this.challengeChannelID)
        );

        const challengeEmbedOptions: MessageOptions =
            await EmbedCreator.createChallengeEmbed(
                this,
                this.isWeekly ? "#af46db" : "#e3b32d",
                language
            );

        await notificationChannel.send({
            content: MessageCreator.createAccept(
                `Successfully started challenge \`${this.challengeid}\`.\n<@&674918022116278282>`
            ),
            ...challengeEmbedOptions,
        });

        return this.createOperationResult(true);
    }

    /**
     * Ends the challenge.
     *
     * @param force Whether to force end the challenge.
     * @param language The locale of the user who attempted to end the challenge. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async end(
        force?: boolean,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: ChallengeLocalization =
            this.getLocalization(language);

        if (!this.isOngoing) {
            return this.createOperationResult(
                false,
                localization.getTranslation("challengeNotOngoing")
            );
        }

        if (
            !force &&
            DateTimeFormatHelper.getTimeDifference(this.timelimit * 1000) > 0
        ) {
            return this.createOperationResult(
                false,
                localization.getTranslation("challengeNotExpired")
            );
        }

        this.status = "finished";

        await DatabaseManager.aliceDb.collections.challenge.update(
            { challengeid: this.challengeid },
            { $set: { status: this.status } }
        );

        const notificationChannel: TextChannel = <TextChannel>(
            await this.client.channels.fetch(this.challengeChannelID)
        );

        const challengeEmbedOptions: MessageOptions =
            await EmbedCreator.createChallengeEmbed(
                this,
                this.isWeekly ? "#af46db" : "#e3b32d",
                language
            );

        await notificationChannel.send({
            content: MessageCreator.createAccept(
                `Successfully ended challenge \`${this.challengeid}\`.`
            ),
            ...challengeEmbedOptions,
        });

        // Award first place in leaderboard
        const firstPlaceScore: Score | undefined = (
            await this.getCurrentLeaderboard()
        ).shift();

        if (firstPlaceScore) {
            const winnerBindInfo: UserBind | null =
                await DatabaseManager.elainaDb.collections.userBind.getFromUid(
                    firstPlaceScore.uid
                );

            if (winnerBindInfo) {
                await DatabaseManager.aliceDb.collections.playerInfo.update(
                    { uid: winnerBindInfo.uid },
                    {
                        $inc: {
                            points: this.isWeekly ? 50 : 25,
                            alicecoins: this.isWeekly ? 100 : 50,
                        },
                    }
                );

                await DatabaseManager.elainaDb.collections.clan.update(
                    { "member_list.id": winnerBindInfo.discordid },
                    { $inc: { power: this.isWeekly ? 50 : 25 } }
                );

                const coinEmoji: GuildEmoji = this.client.emojis.cache.get(
                    Constants.aliceCoinEmote
                )!;

                await notificationChannel.send({
                    content: MessageCreator.createAccept(
                        `Congratulations to <@${
                            winnerBindInfo.discordid
                        }> for achieving first place in challenge \`${
                            this.challengeid
                        }\`, earning them \`${
                            this.isWeekly ? "50" : "25"
                        }\` points and ${coinEmoji}\`${
                            this.isWeekly ? "100" : "50"
                        }\` Alice coins!`
                    ),
                });
            }
        }

        return this.createOperationResult(true);
    }

    /**
     * Checks whether a score fulfills the challenge requirement.
     *
     * @param score The score.
     * @param language The locale of the user who attempted to check the score. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async checkScoreCompletion(
        score: Score,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: ChallengeLocalization =
            this.getLocalization(language);

        if (!this.isConstrainFulfilled(score.mods)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("constrainNotFulfilled")
            );
        }

        if (!this.isModFulfilled(score.mods)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("eznfhtUsage")
            );
        }

        if (!score.replay) {
            await score.downloadReplay();

            if (!score.replay) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("replayNotFound")
                );
            }
        }

        if (
            score.replay.data?.forcedAR ||
            (score.replay.data?.speedModification ?? 1) !== 1
        ) {
            return this.createOperationResult(
                false,
                localization.getTranslation("customARSpeedMulUsage")
            );
        }

        const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
            await DroidBeatmapDifficultyHelper.calculateBeatmapPerformance(
                this.beatmapid,
                await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                    score
                ),
                score.replay
            );

        const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> | null =
            await OsuBeatmapDifficultyHelper.calculateBeatmapPerformance(
                this.beatmapid,
                await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                    score
                )
            );

        if (!droidCalcResult || !osuCalcResult) {
            return this.createOperationResult(
                false,
                localization.getTranslation("beatmapNotFound")
            );
        }

        const pass: boolean = await this.verifyPassCompletion(
            score,
            droidCalcResult,
            osuCalcResult,
            score.replay.calculateHitError()!
        );

        return this.createOperationResult(
            pass,
            localization.getTranslation("passReqNotFulfilled")
        );
    }

    /**
     * Checks whether a replay fulfills the challenge requirement.
     *
     * @param score The data of the replay.
     * @param language The locale of the user who attempted to check the replay. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async checkReplayCompletion(
        replay: ReplayAnalyzer,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: ChallengeLocalization =
            this.getLocalization(language);

        if (!replay.data) {
            await replay.analyze();

            if (!replay.data) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("cannotParseReplay")
                );
            }
        }

        const data: ReplayData = replay.data;

        if (!this.isConstrainFulfilled(data.convertedMods)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("constrainNotFulfilled")
            );
        }

        if (!this.isModFulfilled(data.convertedMods)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("eznfhtUsage")
            );
        }

        if (data.forcedAR || data.speedModification !== 1) {
            return this.createOperationResult(
                false,
                localization.getTranslation("customARSpeedMulUsage")
            );
        }

        const calcResult: [
            PerformanceCalculationResult<DroidPerformanceCalculator>,
            PerformanceCalculationResult<OsuPerformanceCalculator>
        ] = (await this.getReplayCalculationResult(replay))!;

        const pass: boolean = await this.verifyPassCompletion(
            replay,
            calcResult[0],
            calcResult[1],
            replay.calculateHitError()!
        );

        return this.createOperationResult(
            pass,
            localization.getTranslation("passReqNotFulfilled")
        );
    }

    /**
     * Calculates the bonus level achieved by a replay with respect to the challenge.
     *
     * @param replay The replay.
     * @returns The bonus level.
     */
    async calculateBonusLevel(replay: ReplayAnalyzer): Promise<number>;

    /**
     * Calculates the bonus level achieved by a score with respect to the challenge.
     *
     * @param score The score.
     * @returns The bonus level.
     */
    async calculateBonusLevel(score: Score): Promise<number>;

    async calculateBonusLevel(
        scoreOrReplay: Score | ReplayAnalyzer
    ): Promise<number> {
        if (scoreOrReplay instanceof ReplayAnalyzer) {
            if (!scoreOrReplay.data) {
                await scoreOrReplay.analyze();
            }

            if (!scoreOrReplay.data) {
                return 0;
            }
        } else {
            if (!scoreOrReplay.replay) {
                await scoreOrReplay.downloadReplay();
            }

            if (!scoreOrReplay.replay) {
                return 0;
            }
        }

        let droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
            null;
        let osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> | null =
            null;

        if (scoreOrReplay instanceof Score) {
            droidCalcResult =
                await DroidBeatmapDifficultyHelper.calculateScorePerformance(
                    scoreOrReplay
                );
            osuCalcResult =
                await OsuBeatmapDifficultyHelper.calculateScorePerformance(
                    scoreOrReplay
                );
        } else {
            const calcResult:
                | [
                      PerformanceCalculationResult<DroidPerformanceCalculator>,
                      PerformanceCalculationResult<OsuPerformanceCalculator>
                  ]
                | null = await this.getReplayCalculationResult(scoreOrReplay);

            if (calcResult) {
                droidCalcResult = calcResult[0];
                osuCalcResult = calcResult[1];
            }
        }

        if (!droidCalcResult || !osuCalcResult) {
            return 0;
        }

        const scoreV2: number =
            scoreOrReplay instanceof Score
                ? await this.calculateChallengeScoreV2(scoreOrReplay)
                : await this.calculateChallengeScoreV2(scoreOrReplay.data!);

        const replay: ReplayAnalyzer =
            scoreOrReplay instanceof ReplayAnalyzer
                ? scoreOrReplay
                : scoreOrReplay.replay!;

        const hitErrorInformation: HitErrorInformation =
            replay.calculateHitError()!;

        let level: number = 0;

        for (const bonus of this.bonus.values()) {
            let highestLevel: number = 0;

            for (const tier of bonus.list) {
                let bonusComplete: boolean = false;

                switch (bonus.id) {
                    case "score": {
                        const score: number =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.score
                                : scoreOrReplay.data!.score;
                        bonusComplete = score >= tier.value;
                        break;
                    }
                    case "acc": {
                        const accuracy: Accuracy =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.accuracy
                                : scoreOrReplay.data!.accuracy;
                        bonusComplete = accuracy.value() * 100 >= tier.value;
                        break;
                    }
                    case "miss": {
                        const miss: number =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.accuracy.nmiss
                                : scoreOrReplay.data!.accuracy.nmiss;
                        bonusComplete = miss < tier.value || !miss;
                        break;
                    }
                    case "combo": {
                        const combo: number =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.combo
                                : scoreOrReplay.data!.maxCombo;
                        bonusComplete = combo >= tier.value;
                        break;
                    }
                    case "scorev2": {
                        bonusComplete = scoreV2 >= tier.value;
                        break;
                    }
                    case "mod": {
                        const mods: Mod[] =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.mods
                                : scoreOrReplay.data!.convertedMods;
                        bonusComplete =
                            StringHelper.sortAlphabet(
                                mods.map((v) => v.acronym).join("")
                            ) ===
                            StringHelper.sortAlphabet(
                                (<string>tier.value).toUpperCase()
                            );
                        break;
                    }
                    case "rank": {
                        const rank: string =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.rank
                                : scoreOrReplay.data!.rank;
                        bonusComplete =
                            this.getRankTier(rank) >=
                            this.getRankTier(<string>tier.value);
                        break;
                    }
                    case "dpp":
                        bonusComplete =
                            droidCalcResult.result.total >= tier.value;
                        break;
                    case "pp":
                        bonusComplete =
                            osuCalcResult.result.total >= tier.value;
                        break;
                    case "m300": {
                        const n300: number =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.accuracy.n300
                                : scoreOrReplay.data!.accuracy.n300;
                        bonusComplete = n300 >= tier.value;
                        break;
                    }
                    case "m100": {
                        const n100: number =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.accuracy.n100
                                : scoreOrReplay.data!.accuracy.n100;
                        bonusComplete = n100 <= tier.value;
                        break;
                    }
                    case "m50": {
                        const n50: number =
                            scoreOrReplay instanceof Score
                                ? scoreOrReplay.accuracy.n50
                                : scoreOrReplay.data!.accuracy.n50;
                        bonusComplete = n50 <= tier.value;
                        break;
                    }
                    case "ur":
                        bonusComplete =
                            hitErrorInformation.unstableRate <= tier.value;
                        break;
                }

                if (bonusComplete) {
                    highestLevel = Math.max(highestLevel, tier.level);
                }
            }

            level += highestLevel;
        }

        return level;
    }

    /**
     * Gets the top 100 leaderboard of the challenge.
     *
     * @returns The scores that are in the leaderboard of the challenge, sorted by score.
     */
    async getCurrentLeaderboard(): Promise<Score[]> {
        const scores: Score[] = await ScoreHelper.fetchDroidLeaderboard(
            this.hash
        );

        return scores;
    }

    /**
     * Gets the pass requirement information of the challenge.
     *
     * @param language The locale to get the information for. Defaults to English.
     */
    getPassInformation(language: Language = "en"): string {
        return this.getPassOrBonusDescription(
            this.pass.id,
            this.pass.value,
            language
        );
    }

    /**
     * Gets the bonus requirement information of the challenge.
     *
     * @param language The locale to get the information for. Defaults to English.
     */
    getBonusInformation(language: Language = "en"): BonusDescription[] {
        const localization: ChallengeLocalization =
            this.getLocalization(language);

        return this.bonus.map((v) => {
            return {
                id: localization.getTranslation(this.bonusIdToString(v.id)),
                description: v.list
                    .map(
                        (b) =>
                            `**${localization.getTranslation("level")} ${
                                b.level
                            }**: ${this.getPassOrBonusDescription(
                                v.id,
                                b.value,
                                language
                            )}`
                    )
                    .join("\n"),
            };
        });
    }

    /**
     * Checks if a sequence of mods fulfills the challenge's constrain.
     *
     * @param mods The mods.
     */
    private isConstrainFulfilled(mods: Mod[]): boolean {
        return (
            !this.constrain ||
            StringHelper.sortAlphabet(mods.map((v) => v.acronym).join("")) ===
                StringHelper.sortAlphabet(this.constrain.toUpperCase())
        );
    }

    /**
     * Checks if a sequence of mods fulfills general challenge requirement.
     *
     * @param mods The mods.
     */
    private isModFulfilled(mods: Mod[]): boolean {
        return !mods.some(
            (m) =>
                m instanceof ModEasy ||
                m instanceof ModNoFail ||
                m instanceof ModHalfTime
        );
    }

    /**
     * Verifies whether a score passes the challenge.
     *
     * @param score The score to verify.
     * @param droidCalcResult The osu!droid calculation result of the score.
     * @param osuCalcResult The osu!standard calculation result of the score.
     * @param hitErrorInformation The hit error information of the score.
     */
    private async verifyPassCompletion(
        score: Score,
        droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator>,
        osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator>,
        hitErrorInformation: HitErrorInformation
    ): Promise<boolean>;

    /**
     * Verifies whether a replay passes the challenge.
     *
     * @param replay The replay to verify.
     * @param calcResult The calculation result of the replay.
     * @param hitErrorInformation The hit error information of the replay.
     */
    private async verifyPassCompletion(
        replay: ReplayAnalyzer,
        droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator>,
        osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator>,
        hitErrorInformation: HitErrorInformation
    ): Promise<boolean>;

    private async verifyPassCompletion(
        scoreOrReplay: Score | ReplayAnalyzer,
        droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator>,
        osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator>,
        hitErrorInformation: HitErrorInformation
    ): Promise<boolean> {
        switch (this.pass.id) {
            case "score": {
                const score: number =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.score
                        : scoreOrReplay.data!.score;
                return score >= this.pass.value;
            }
            case "acc": {
                const accuracy: Accuracy =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.accuracy
                        : scoreOrReplay.data!.accuracy;
                return accuracy.value() * 100 >= this.pass.value;
            }
            case "miss": {
                const miss: number =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.accuracy.nmiss
                        : scoreOrReplay.data!.accuracy.nmiss;
                return miss < this.pass.value || !miss;
            }
            case "combo": {
                const combo: number =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.combo
                        : scoreOrReplay.data!.maxCombo;
                return combo >= this.pass.value;
            }
            case "scorev2": {
                const scoreV2: number =
                    scoreOrReplay instanceof Score
                        ? await this.calculateChallengeScoreV2(scoreOrReplay)
                        : await this.calculateChallengeScoreV2(
                              scoreOrReplay.data!
                          );
                return scoreV2 >= this.pass.value;
            }
            case "rank": {
                const rank: string =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.rank
                        : scoreOrReplay.data!.rank;
                return (
                    this.getRankTier(rank) >=
                    this.getRankTier(<string>this.pass.value)
                );
            }
            case "dpp":
                return droidCalcResult.result.total >= this.pass.value;
            case "pp":
                return osuCalcResult.result.total >= this.pass.value;
            case "m300": {
                const n300: number =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.accuracy.n300
                        : scoreOrReplay.data!.accuracy.n300;
                return n300 >= this.pass.value;
            }
            case "m100": {
                const n100: number =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.accuracy.n100
                        : scoreOrReplay.data!.accuracy.n100;
                return n100 <= this.pass.value;
            }
            case "m50": {
                const n50: number =
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.accuracy.n50
                        : scoreOrReplay.data!.accuracy.n50;
                return n50 <= this.pass.value;
            }
            case "ur":
                return hitErrorInformation.unstableRate <= this.pass.value;
        }
    }

    /**
     * Converts a bonus ID into its string literal.
     *
     * @param id The bonus ID.
     * @returns The string literal of the corresponding ID.
     */
    private bonusIdToString(id: BonusID): keyof ChallengeStrings {
        switch (id) {
            case "score":
                return "scoreV1";
            case "acc":
                return "accuracy";
            case "scorev2":
                return "scoreV2";
            case "miss":
                return "missCount";
            case "combo":
                return "combo";
            case "rank":
                return "rank";
            case "mod":
                return "mods";
            case "dpp":
                return "droidPP";
            case "pp":
                return "pcPP";
            case "m300":
                return "min300";
            case "m100":
                return "max100";
            case "m50":
                return "max50";
            case "ur":
                return "maxUR";
        }
    }

    /**
     * Gets the description of a pass or bonus requirement.
     *
     * @param id The ID of the pass or bonus requirement.
     * @param value The value that must be fulfilled to pass the requirement.
     * @param language The locale to get the description for. Defaults to English.
     * @returns The description of the requirement.
     */
    private getPassOrBonusDescription(
        id: BonusID,
        value: string | number,
        language: Language = "en"
    ): string {
        const localization: ChallengeLocalization =
            this.getLocalization(language);

        switch (id) {
            case "score":
                return StringHelper.formatString(
                    localization.getTranslation("scoreV1Description"),
                    `**${value.toLocaleString(
                        LocaleHelper.convertToBCP47(language)
                    )}**`
                );
            case "acc":
                return StringHelper.formatString(
                    localization.getTranslation("accuracyDescription"),
                    `**${value}**`
                );
            case "scorev2":
                return StringHelper.formatString(
                    localization.getTranslation("scoreV2Description"),
                    `**${value.toLocaleString(
                        LocaleHelper.convertToBCP47(language)
                    )}**`
                );
            case "miss":
                return value === 0
                    ? localization.getTranslation("noMisses")
                    : StringHelper.formatString(
                          localization.getTranslation("missCountDescription"),
                          `**${value}**`
                      );
            case "mod":
                return StringHelper.formatString(
                    localization.getTranslation("modsDescription"),
                    `**${(<string>value).toUpperCase()}**`
                );
            case "combo":
                return StringHelper.formatString(
                    localization.getTranslation("comboDescription"),
                    `**${value}**`
                );
            case "rank":
                return StringHelper.formatString(
                    localization.getTranslation("rankDescription"),
                    `**${(<string>value).toUpperCase()}**`
                );
            case "dpp":
                return StringHelper.formatString(
                    localization.getTranslation("droidPPDescription"),
                    `**${value}**`
                );
            case "pp":
                return StringHelper.formatString(
                    localization.getTranslation("pcPPDescription"),
                    `**${value}**`
                );
            case "m300":
                return StringHelper.formatString(
                    localization.getTranslation("min300Description"),
                    `**${value}**`
                );
            case "m100":
                return StringHelper.formatString(
                    localization.getTranslation("max100Description"),
                    `**${value}**`
                );
            case "m50":
                return StringHelper.formatString(
                    localization.getTranslation("max50Description"),
                    `**${value}**`
                );
            case "ur":
                return StringHelper.formatString(
                    localization.getTranslation("maxURDescription"),
                    `**${value}**`
                );
        }
    }

    /**
     * Gets the tier of a rank.
     *
     * @param rank The rank.
     * @returns The tier of the rank.
     */
    private getRankTier(rank: string): number {
        switch (rank.toUpperCase()) {
            case "D":
                return 1;
            case "C":
                return 2;
            case "B":
                return 3;
            case "A":
                return 4;
            case "S":
                return 5;
            case "SH":
                return 6;
            case "X":
                return 7;
            case "XH":
                return 8;
            default:
                return 0;
        }
    }

    /**
     * Calculates a replay with respect to the challenge.
     *
     * @param replay The replay to calculate.
     * @returns The calculation result.
     */
    private async getReplayCalculationResult(
        replay: ReplayAnalyzer
    ): Promise<
        | [
              PerformanceCalculationResult<DroidPerformanceCalculator>,
              PerformanceCalculationResult<OsuPerformanceCalculator>
          ]
        | null
    > {
        const data: ReplayData | null = replay.data;

        if (!data) {
            return null;
        }

        const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> =
            (await DroidBeatmapDifficultyHelper.calculateBeatmapPerformance(
                this.beatmapid,
                new PerformanceCalculationParameters(
                    data.accuracy,
                    data.accuracy.value() * 100,
                    data.maxCombo,
                    1,
                    new MapStats({
                        mods: data.convertedMods,
                        ar: data.forcedAR,
                        isForceAR: !!data.forcedAR,
                        speedMultiplier: data.speedModification,
                        oldStatistics: data.replayVersion <= 3,
                    })
                ),
                replay
            ))!;

        const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> =
            (await OsuBeatmapDifficultyHelper.calculateBeatmapPerformance(
                this.beatmapid,
                new PerformanceCalculationParameters(
                    data.accuracy,
                    data.accuracy.value() * 100,
                    data.maxCombo,
                    1,
                    new MapStats({
                        mods: data.convertedMods,
                        ar: data.forcedAR,
                        isForceAR: !!data.forcedAR,
                        speedMultiplier: data.speedModification,
                        oldStatistics: data.replayVersion <= 3,
                    })
                )
            ))!;

        return [droidCalcResult, osuCalcResult];
    }

    /**
     * Calculates the ScoreV2 of a replay.
     *
     * @param replay The data of the replay.
     */
    private async calculateChallengeScoreV2(
        replay: ReplayData
    ): Promise<number>;

    /**
     * Calculates the ScoreV2 of a score.
     *
     * @param score The score.
     */
    private async calculateChallengeScoreV2(score: Score): Promise<number>;

    private async calculateChallengeScoreV2(
        scoreOrReplay: Score | ReplayData
    ): Promise<number> {
        const beatmapInfo: MapInfo = (await BeatmapManager.getBeatmap(
            this.beatmapid,
            false
        ))!;

        const maximumScore: number = beatmapInfo.maxScore(
            new MapStats({
                cs: beatmapInfo.cs,
                ar: beatmapInfo.ar,
                od: beatmapInfo.od,
                hp: beatmapInfo.hp,
                mods: ModUtil.pcStringToMods(this.constrain),
                speedMultiplier:
                    scoreOrReplay instanceof Score
                        ? scoreOrReplay.speedMultiplier
                        : scoreOrReplay.speedModification,
            })
        );

        const tempScoreV2: number =
            (scoreOrReplay.score / maximumScore) * 6e5 +
            Math.pow(scoreOrReplay.accuracy.value(), 4) * 4e5;

        return tempScoreV2 - scoreOrReplay.accuracy.nmiss * 0.003 * tempScoreV2;
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): ChallengeLocalization {
        return new ChallengeLocalization(language);
    }
}
