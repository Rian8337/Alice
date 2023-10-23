import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { OperationResult } from "structures/core/OperationResult";
import { DatabaseUserBind } from "structures/database/elainaDb/DatabaseUserBind";
import { PPEntry } from "@alice-structures/dpp/PPEntry";
import { PrototypePPEntry } from "@alice-structures/dpp/PrototypePPEntry";
import { RecalculationProgress } from "@alice-structures/dpp/RecalculationProgress";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Collection, Snowflake } from "discord.js";
import { Clan } from "./Clan";
import { ObjectId, UpdateFilter } from "mongodb";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { consola } from "consola";
import {
    MapInfo,
    DroidAPIRequestBuilder,
    RequestResponse,
    Precision,
    Accuracy,
} from "@rian8337/osu-base";
import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { Score, Player } from "@rian8337/osu-droid-utilities";
import { UserBindLocalization } from "@alice-localization/database/utils/elainaDb/UserBind/UserBindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Language } from "@alice-localization/base/Language";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { DiscordBackendRESTManager } from "@alice-utils/managers/DiscordBackendRESTManager";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { RebalanceDroidPerformanceAttributes } from "@alice-structures/difficultyattributes/RebalanceDroidPerformanceAttributes";

/**
 * Represents a Discord user who has at least one osu!droid account binded.
 */
export class UserBind extends Manager {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * The UID of the osu!droid account binded to the user.
     */
    uid: number;

    /**
     * The username of the osu!droid account binded to the user.
     */
    username: string;

    /**
     * The total droid performance points (dpp) that the user has.
     */
    pptotal: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;

    /**
     * The weighted accuracy of the player.
     */
    weightedAccuracy: number;

    /**
     * The droid performance points entries of the user, mapped by hash.
     */
    pp: Collection<string, PPEntry>;

    /**
     * The clan the user is currently in.
     */
    clan?: string;

    /**
     * The UID of osu!droid accounts that are binded to the user.
     *
     * A user can only bind up to 2 osu!droid accounts, therefore
     * the maximum length of this array will never exceed 2.
     */
    previous_bind: number[];

    /**
     * The epoch time at which the user can join another clan, in seconds.
     */
    joincooldown?: number;

    /**
     * The last clan that the user was in.
     */
    oldclan?: string;

    /**
     * The epoch time at which the user can rejoin their old clan, in seconds.
     */
    oldjoincooldown?: number;

    /**
     * Whether the user has asked for droid performance points and ranked score recalculation.
     */
    hasAskedForRecalc: boolean;

    /**
     * Whether the ongoing dpp scan is completed for this user.
     */
    dppScanComplete?: boolean;

    /**
     * Whether the ongoing dpp recalculation is completed for this user.
     */
    dppRecalcComplete?: boolean;

    /**
     * Progress of ongoing dpp calculation.
     */
    calculationInfo?: RecalculationProgress;

    /**
     * Whether the daily role connection metadata for this user has been completed.
     */
    dailyRoleMetadataUpdateComplete?: boolean;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    private get bindDb(): UserBindCollectionManager {
        return DatabaseManager.elainaDb.collections.userBind;
    }

    constructor(
        data: DatabaseUserBind = DatabaseManager.elainaDb?.collections.userBind
            .defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.uid = data.uid;
        this.username = data.username;
        this.pptotal = data.pptotal;
        this.playc = data.playc;
        this.weightedAccuracy = data.weightedAccuracy;
        this.pp = ArrayHelper.arrayToCollection(data.pp ?? [], "hash");
        this.clan = data.clan;
        this.previous_bind = data.previous_bind ?? [];
        this.joincooldown = data.joincooldown;
        this.oldclan = data.oldclan;
        this.oldjoincooldown = data.oldjoincooldown;
        this.hasAskedForRecalc = data.hasAskedForRecalc;
        this.dppScanComplete = data.dppScanComplete;
        this.dppRecalcComplete = data.dppRecalcComplete;
        this.calculationInfo = data.calculationInfo;
        this.dailyRoleMetadataUpdateComplete =
            data.dailyRoleMetadataUpdateComplete;
    }

    /**
     * Checks whether this player is dpp-banned.
     */
    async isDPPBanned(): Promise<boolean> {
        return (
            (
                await DatabaseManager.elainaDb.collections.dppBan.get(
                    "uid",
                    {
                        uid: {
                            $in: this.previous_bind,
                        },
                    },
                    { projection: { _id: 0 } },
                )
            ).size > 0
        );
    }

    /**
     * Scans the dpp list of this player, removing those that are outdated.
     *
     * @returns An object containing information about the operation.
     */
    async scanDPP(): Promise<OperationResult> {
        if (await this.isDPPBanned()) {
            // Reset everything if user is banned.
            this.pp = new Collection();
            this.pptotal = 0;
            this.playc = 0;

            return this.bindDb.updateOne(
                { discordid: this.discordid },
                {
                    $set: {
                        pp: [],
                        pptotal: 0,
                        playc: 0,
                        dppScanComplete: true,
                    },
                },
            );
        }

        const hashesToDelete: string[] = [];

        for (const ppEntry of this.pp.values()) {
            const beatmapInfo: MapInfo<false> | null =
                await BeatmapManager.getBeatmap(ppEntry.hash, {
                    checkFile: false,
                    cacheBeatmap: false,
                });

            await HelperFunctions.sleep(0.2);

            if (
                !beatmapInfo ||
                (await DPPHelper.checkSubmissionValidity(beatmapInfo)) !==
                    DPPSubmissionValidity.valid
            ) {
                hashesToDelete.push(ppEntry.hash);
                this.pp.delete(ppEntry.hash);
                this.playc = Math.max(0, this.playc - 1);
            }
        }

        // Even if there are no deletions, still update to keep track of scan progress.
        const totalPP: number = DPPHelper.calculateFinalPerformancePoints(
            this.pp,
        );

        const query: UpdateFilter<DatabaseUserBind> = {
            $set: {
                dppScanComplete: true,
            },
        };

        if (!Precision.almostEqualsNumber(totalPP, this.pptotal)) {
            this.pptotal = totalPP;

            Object.defineProperties(query.$set!, {
                pptotal: {
                    value: this.pptotal,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                },
                playc: {
                    value: this.playc,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                },
            });

            Object.defineProperty(query, "$pull", {
                value: {
                    "pp.hash": {
                        $in: hashesToDelete,
                    },
                },
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }

        return this.bindDb.updateOne({ discordid: this.discordid }, query);
    }

    /**
     * Sets the dpp list for the player to a new list.
     *
     * @param list The new list.
     * @param playCountIncrement The amount to increment towards play count.
     * @returns An object containing information about the operation.
     */
    async setNewDPPValue(
        list: Collection<string, PPEntry>,
        playCountIncrement: number,
    ): Promise<OperationResult> {
        this.pp = list;

        this.pp.sort((a, b) => b.pp - a.pp);

        this.playc += Math.max(0, playCountIncrement);

        this.weightedAccuracy = DPPHelper.calculateWeightedAccuracy(this.pp);

        const finalPP: number = DPPHelper.calculateFinalPerformancePoints(list);

        const result = await this.bindDb.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    pptotal: finalPP,
                    pp: [...this.pp.values()],
                    weightedAccuracy: this.weightedAccuracy,
                },
                $inc: {
                    playc: Math.max(0, playCountIncrement),
                },
            },
        );

        if (result.success) {
            await DiscordBackendRESTManager.updateMetadata(this.discordid);
        }

        return result;
    }

    /**
     * Recalculates this player's dpp, only taking account plays from
     * the current dpp list.
     */
    async recalculateDPP(): Promise<OperationResult> {
        const newList: Collection<string, PPEntry> = new Collection();

        for (const ppEntry of this.pp.values()) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                ppEntry.hash,
                {
                    checkFile: false,
                },
            );

            if (!beatmapInfo) {
                continue;
            }

            const score: Score | null = await Score.getFromHash(
                ppEntry.uid,
                beatmapInfo.hash,
            );

            if (!score) {
                continue;
            }

            const attribs: CompleteCalculationAttributes<
                DroidDifficultyAttributes,
                DroidPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getBestScorePerformance(
                score.uid,
                beatmapInfo.hash,
                PPCalculationMethod.live,
            );

            if (!attribs) {
                continue;
            }

            await HelperFunctions.sleep(0.1);

            const [needsPersistence] = DPPHelper.insertScore(newList, [
                DPPHelper.scoreToPPEntry(beatmapInfo.fullTitle, score, attribs),
            ]);

            if (needsPersistence) {
                if (attribs.localReplayMD5) {
                    await DPPProcessorRESTManager.persistLocalReplay(
                        ppEntry.uid,
                        beatmapInfo.hash,
                        attribs.localReplayMD5,
                    );
                } else {
                    await DPPProcessorRESTManager.persistOnlineReplay(
                        ppEntry.uid,
                        score.scoreID,
                    );
                }
            }
        }

        this.pp = newList;
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(newList);

        await this.bindDb.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    pp: [...this.pp.values()],
                    pptotal: this.pptotal,
                    weightedAccuracy: DPPHelper.calculateWeightedAccuracy(
                        this.pp,
                    ),
                    dppRecalcComplete: true,
                },
            },
        );

        const metadataOperation: RequestResponse =
            await DiscordBackendRESTManager.updateMetadata(this.discordid);

        return this.createOperationResult(metadataOperation.statusCode === 200);
    }

    /**
     * Calculates this player's dpp into the prototype dpp database.
     */
    async calculatePrototypeDPP(): Promise<OperationResult> {
        const newList: Collection<string, PrototypePPEntry> = new Collection();

        for (const ppEntry of this.pp.values()) {
            const score: Score | null = await Score.getFromHash(
                ppEntry.uid,
                ppEntry.hash,
            );

            if (!score) {
                continue;
            }

            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                score.hash,
                { checkFile: false },
            );

            if (!beatmapInfo) {
                continue;
            }

            const liveAttribs: CompleteCalculationAttributes<
                DroidDifficultyAttributes,
                DroidPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getBestScorePerformance(
                ppEntry.uid,
                beatmapInfo.hash,
                PPCalculationMethod.live,
            );

            if (!liveAttribs) {
                continue;
            }

            const rebalAttribs: CompleteCalculationAttributes<
                RebalanceDroidDifficultyAttributes,
                RebalanceDroidPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getBestScorePerformance(
                ppEntry.uid,
                beatmapInfo.hash,
                PPCalculationMethod.rebalance,
            );

            if (!rebalAttribs) {
                continue;
            }

            const { performance: perfResult, params } = liveAttribs;
            const { performance: rebalPerfResult, params: rebalParams } =
                rebalAttribs;

            const { customStatistics, accuracy: accuracyData } = params;
            const accuracy = new Accuracy(accuracyData);

            // This is moved from dpp calculation to minimize core module change.
            // Normalize the deviation to 300 BPM.
            const normalizedDeviation: number =
                rebalPerfResult.tapDeviation *
                Math.max(1, 50 / rebalAttribs.difficulty.averageSpeedDeltaTime);
            // We expect the player to get 7500/x deviation when doubletapping x BPM.
            // Using this expectation, we penalize scores with deviation above 25.
            const averageBPM: number =
                60000 / 4 / rebalAttribs.difficulty.averageSpeedDeltaTime;
            const adjustedDeviation: number =
                normalizedDeviation *
                (1 +
                    1 /
                        (1 +
                            Math.exp(
                                -(normalizedDeviation - 7500 / averageBPM) /
                                    ((2 * 300) / averageBPM),
                            )));

            const entry: PrototypePPEntry = {
                uid: score.uid,
                hash: beatmapInfo.hash,
                title: beatmapInfo.fullTitle,
                pp: NumberHelper.round(rebalPerfResult.total, 2),
                newAim: NumberHelper.round(rebalPerfResult.aim, 2),
                newTap: NumberHelper.round(rebalPerfResult.tap, 2),
                newAccuracy: NumberHelper.round(rebalPerfResult.accuracy, 2),
                newVisual: NumberHelper.round(rebalPerfResult.visual, 2),
                prevPP: NumberHelper.round(perfResult.total, 2),
                prevAim: NumberHelper.round(perfResult.aim, 2),
                prevTap: NumberHelper.round(perfResult.tap, 2),
                prevAccuracy: NumberHelper.round(perfResult.accuracy, 2),
                prevVisual: NumberHelper.round(perfResult.visual, 2),
                mods: rebalAttribs.difficulty.mods,
                accuracy: NumberHelper.round(accuracy.value() * 100, 2),
                combo: params.combo,
                miss: accuracy.nmiss,
                speedMultiplier:
                    customStatistics.speedMultiplier !== 1
                        ? customStatistics.speedMultiplier
                        : undefined,
                calculatedUnstableRate: rebalPerfResult.calculatedUnstableRate,
                estimatedUnstableRate: NumberHelper.round(
                    rebalPerfResult.deviation * 10,
                    2,
                ),
                estimatedSpeedUnstableRate: NumberHelper.round(
                    rebalPerfResult.tapDeviation * 10,
                    2,
                ),
                adjustedSpeedUnstableRate: NumberHelper.round(
                    adjustedDeviation * 10,
                    2,
                ),
                overallDifficulty: rebalAttribs.difficulty.overallDifficulty,
                hit300: accuracy.n300,
                hit100: accuracy.n100,
                hit50: accuracy.n50,
                aimSliderCheesePenalty: rebalPerfResult.aimSliderCheesePenalty,
                flashlightSliderCheesePenalty:
                    rebalPerfResult.flashlightSliderCheesePenalty,
                visualSliderCheesePenalty:
                    rebalPerfResult.visualSliderCheesePenalty,
                speedNoteCount: rebalAttribs.difficulty.speedNoteCount,
                liveTapPenalty: params.tapPenalty,
                rebalanceTapPenalty: rebalParams.tapPenalty,
            };

            consola.info(
                `${beatmapInfo.fullTitle} ${score.completeModString}: ${entry.prevPP} ⮕  ${entry.pp}`,
            );

            newList.set(ppEntry.hash, entry);
        }

        const newTotal = DPPHelper.calculateFinalPerformancePoints(newList);

        consola.info(`${this.pptotal} ⮕  ${newTotal.toFixed(2)}`);

        return DatabaseManager.aliceDb.collections.prototypePP.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    pp: [...newList.values()],
                    pptotal: newTotal,
                    prevpptotal: this.pptotal,
                    lastUpdate: Date.now(),
                    previous_bind: this.previous_bind,
                    uid: this.uid,
                    username: this.username,
                    scanDone: true,
                },
            },
            { upsert: true },
        );
    }

    /**
     * Recalculates all of the player's scores for dpp and ranked score.
     *
     * @param markAsSlotFulfill Whether to set `hasAskedForRecalc` to `true`.
     * @param isDPPRecalc Whether this recalculation is a part of a full recalculation triggered by bot owners.
     */
    async recalculateAllScores(
        markAsSlotFulfill: boolean = true,
        isDPPRecalc: boolean = false,
    ): Promise<OperationResult> {
        let newList: Collection<string, PPEntry> = new Collection();
        let playCount: number = 0;

        const getScores = async (
            uid: number,
            page: number,
        ): Promise<Score[]> => {
            const apiRequestBuilder: DroidAPIRequestBuilder =
                new DroidAPIRequestBuilder()
                    .setEndpoint("scoresearchv2.php")
                    .addParameter("uid", uid)
                    .addParameter("page", page - 1);

            const data: RequestResponse = await apiRequestBuilder.sendRequest();

            if (data.statusCode !== 200) {
                return [];
            }

            const entries: string[] = data.data.toString("utf-8").split("<br>");

            entries.shift();

            return entries.map((v) => new Score().fillInformation(v));
        };

        for (let i = 0; i < this.previous_bind.length; ++i) {
            const uid: number = this.previous_bind[i];

            if (
                await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
                    uid,
                )
            ) {
                continue;
            }

            if (
                isDPPRecalc &&
                this.calculationInfo &&
                uid !== this.calculationInfo.uid
            ) {
                continue;
            }

            const player: Player | null = await Player.getInformation(uid);
            if (!player) {
                continue;
            }

            let page: number = 0;

            if (isDPPRecalc && this.calculationInfo) {
                page = this.calculationInfo.page;
                playCount = this.calculationInfo.playc;
                newList = new Collection(
                    this.calculationInfo.currentPPEntries.map((v) => [
                        v.hash,
                        v,
                    ]),
                );
            }

            let scores: Score[];

            while ((scores = await getScores(uid, ++page)).length) {
                const scoreCount: number = scores.length;

                if (isDPPRecalc) {
                    consola.info(
                        `Calculating ${scoreCount} scores from page ${page}`,
                    );
                }

                let score: Score | undefined;

                while ((score = scores.shift())) {
                    const beatmapInfo: MapInfo | null =
                        await BeatmapManager.getBeatmap(score.hash, {
                            checkFile: false,
                        }).catch(() => null);

                    if (!beatmapInfo) {
                        continue;
                    }

                    const submissionValidity: DPPSubmissionValidity =
                        await DPPHelper.checkSubmissionValidity(beatmapInfo);

                    if (submissionValidity !== DPPSubmissionValidity.valid) {
                        continue;
                    }

                    const attribs: CompleteCalculationAttributes<
                        DroidDifficultyAttributes,
                        DroidPerformanceAttributes
                    > | null =
                        await DPPProcessorRESTManager.getBestScorePerformance(
                            score.uid,
                            beatmapInfo.hash,
                            PPCalculationMethod.live,
                        );

                    if (!attribs) {
                        continue;
                    }

                    this.playc = Math.max(this.playc, ++playCount);

                    const ppEntry: PPEntry = DPPHelper.scoreToPPEntry(
                        beatmapInfo.fullTitle,
                        score,
                        attribs,
                    );

                    const [needsPersistence] = DPPHelper.insertScore(newList, [
                        ppEntry,
                    ]);

                    if (needsPersistence) {
                        if (attribs.localReplayMD5) {
                            await DPPProcessorRESTManager.persistLocalReplay(
                                ppEntry.uid,
                                beatmapInfo.hash,
                                attribs.localReplayMD5,
                            );
                        } else {
                            await DPPProcessorRESTManager.persistOnlineReplay(
                                ppEntry.uid,
                                score.scoreID,
                            );
                        }
                    }
                }

                if (isDPPRecalc) {
                    this.calculationInfo = {
                        uid: uid,
                        page: page,
                        playc: playCount,
                        currentPPEntries: [...newList.values()],
                    };

                    await this.bindDb.updateOne(
                        { discordid: this.discordid },
                        {
                            $set: {
                                calculationInfo: this.calculationInfo,
                            },
                        },
                    );
                }
            }

            if (isDPPRecalc && this.previous_bind[i + 1]) {
                this.calculationInfo = {
                    uid: this.previous_bind[i + 1],
                    page: 0,
                    playc: playCount,
                    currentPPEntries: [...newList.values()],
                };

                await this.bindDb.updateOne(
                    { discordid: this.discordid },
                    {
                        $set: {
                            calculationInfo: this.calculationInfo,
                        },
                    },
                );
            }
        }

        this.pp = newList;
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(newList);
        this.weightedAccuracy = DPPHelper.calculateWeightedAccuracy(this.pp);

        const query: UpdateFilter<DatabaseUserBind> = {
            $set: {
                pp: [...this.pp.values()],
                pptotal: this.pptotal,
                playc: this.playc,
                weightedAccuracy: this.weightedAccuracy,
                // Only set to true if hasAskedForRecalc is originally false
                hasAskedForRecalc: markAsSlotFulfill || this.hasAskedForRecalc,
            },
            $unset: {
                calculationInfo: "",
            },
        };

        if (isDPPRecalc) {
            Object.defineProperty(query.$set, "dppRecalcComplete", {
                value: true,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        }

        await this.bindDb.updateOne({ discordid: this.discordid }, query);

        const metadataOperation: RequestResponse =
            await DiscordBackendRESTManager.updateMetadata(this.discordid);

        return this.createOperationResult(metadataOperation.statusCode === 200);
    }

    /**
     * Moves the bind of a binded osu!droid account in this Discord account to another
     * Discord account.
     *
     * @param uid The uid of the osu!droid account.
     * @param to The ID of the Discord account to move to.
     * @param language The locale of the user who attempted to move the bind. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async moveBind(
        uid: number,
        to: Snowflake,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization: UserBindLocalization =
            this.getLocalization(language);

        if (!this.previous_bind.includes(uid)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("uidNotBindedToAccount"),
            );
        }

        if (this.discordid === to) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cannotRebindToSameAccount"),
            );
        }

        const otherBindInfo: UserBind | null = await this.bindDb.getFromUser(
            to,
            {
                projection: {
                    _id: 0,
                    pp: 1,
                    playc: 1,
                    previous_bind: 1,
                },
            },
        );

        const otherPreviousBind: number[] = otherBindInfo?.previous_bind ?? [];

        if (otherPreviousBind.length >= 2) {
            return this.createOperationResult(
                false,
                localization.getTranslation("bindLimitReachedInOtherAccount"),
            );
        }

        this.previous_bind.splice(this.previous_bind.indexOf(uid), 1);

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);
        }

        const player: Player | null = await Player.getInformation(uid);

        if (!player) {
            this.previous_bind.push(uid);

            return this.createOperationResult(
                false,
                localization.getTranslation("playerNotFound"),
            );
        }

        this.username = player.username;

        otherPreviousBind.push(uid);

        if (this.previous_bind.length === 0) {
            await this.bindDb.deleteOne({
                discordid: this.discordid,
            });

            await DatabaseManager.aliceDb.collections.nameChange.updateOne(
                { discordid: this.discordid },
                {
                    $set: {
                        discordid: to,
                    },
                },
            );

            if (otherBindInfo?.pp) {
                DPPHelper.insertScore(this.pp, [...otherBindInfo.pp.values()]);
            }

            this.discordid = to;

            await this.bindDb.updateOne(
                { discordid: this.discordid },
                {
                    $set: {
                        previous_bind: otherPreviousBind,
                        pptotal: DPPHelper.calculateFinalPerformancePoints(
                            this.pp,
                        ),
                        playc: this.playc + (otherBindInfo?.playc ?? 0),
                        pp: [...this.pp.values()],
                        weightedAccuracy: DPPHelper.calculateWeightedAccuracy(
                            this.pp,
                        ),
                    },
                    $setOnInsert: {
                        uid: uid,
                        username: player.username,
                        clan: this.clan,
                        oldclan: this.oldclan,
                        oldjoincooldown: this.oldjoincooldown ?? undefined,
                        hasAskedForRecalc: this.hasAskedForRecalc,
                        dppScanComplete: this.dppScanComplete ?? undefined,
                        dppRecalcComplete: this.dppRecalcComplete ?? undefined,
                        calculationInfo: this.calculationInfo ?? undefined,
                    },
                },
                { upsert: true },
            );
        } else {
            const newPPEntries: Collection<string, PPEntry> = this.pp.filter(
                (v) => v.uid === uid,
            );
            const oldPPEntries: Collection<string, PPEntry> =
                this.pp.difference(newPPEntries);

            await this.bindDb.updateOne(
                { discordid: this.discordid },
                {
                    $pull: {
                        previous_bind: uid,
                    },
                    $set: {
                        uid: this.uid,
                        pptotal:
                            DPPHelper.calculateFinalPerformancePoints(
                                oldPPEntries,
                            ),
                        pp: [...oldPPEntries.values()],
                        weightedAccuracy:
                            DPPHelper.calculateWeightedAccuracy(oldPPEntries),
                    },
                },
            );

            await this.bindDb.updateOne(
                { discordid: to },
                {
                    $set: {
                        previous_bind: otherPreviousBind,
                        pptotal:
                            DPPHelper.calculateFinalPerformancePoints(
                                newPPEntries,
                            ),
                        playc: player.playCount,
                        pp: [...newPPEntries.values()],
                        weightedAccuracy:
                            DPPHelper.calculateWeightedAccuracy(newPPEntries),
                    },
                    $setOnInsert: {
                        uid: uid,
                        username: player.username,
                        hasAskedForRecalc: false,
                        clan: "",
                    },
                },
                { upsert: true },
            );
        }

        return DatabaseManager.aliceDb.collections.playerInfo.updateOne(
            { uid: uid },
            {
                $set: {
                    discordid: to,
                },
            },
        );
    }

    /**
     * Binds an osu!droid account to this Discord account.
     *
     * @param uid The uid of the osu!droid account.
     * @param language The locale of the user who attempted to bind. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async bind(uid: number, language?: Language): Promise<OperationResult>;

    /**
     * Binds an osu!droid account to this Discord account.
     *
     * @param username The username of the osu!droid account.
     * @param language The locale of the user who attempted to bind. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async bind(username: string, language?: Language): Promise<OperationResult>;

    /**
     * Binds an osu!droid account to this Discord account.
     *
     * @param player The `Player` instance of the osu!droid account.
     * @param language The locale of the user who attempted to bind. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async bind(player: Player, language?: Language): Promise<OperationResult>;

    async bind(
        uidOrUsernameOrPlayer: string | number | Player,
        language: Language = "en",
    ): Promise<OperationResult> {
        const player: Player | null =
            uidOrUsernameOrPlayer instanceof Player
                ? uidOrUsernameOrPlayer
                : await Player.getInformation(uidOrUsernameOrPlayer);

        const localization: UserBindLocalization =
            this.getLocalization(language);

        if (!player) {
            return this.createOperationResult(
                false,
                localization.getTranslation("playerWithUidOrUsernameNotFound"),
            );
        }

        if (!this.isUidBinded(player.uid)) {
            if (this.previous_bind.length >= 2) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("bindLimitReached"),
                );
            }

            this.previous_bind.push(player.uid);
        }

        this.uid = player.uid;
        this.username = player.username;

        return this.bindDb.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    username: this.username,
                    uid: this.uid,
                    previous_bind: this.previous_bind,
                },
            },
        );
    }

    /**
     * Unbinds an osu!droid account from this Discord account.
     *
     * @param uid The uid of the osu!droid account.
     * @param language The locale of the user who attempted to unbind.
     * @returns An object containing information about the operation.
     */
    async unbind(
        uid: number,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization: UserBindLocalization =
            this.getLocalization(language);

        if (!this.isUidBinded(uid)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("uidNotBindedToAccount"),
            );
        }

        this.previous_bind.splice(this.previous_bind.indexOf(uid), 1);

        if (this.previous_bind.length === 0) {
            // Kick the user from any clan
            if (this.clan) {
                const clan: Clan | null =
                    await DatabaseManager.elainaDb.collections.clan.getFromName(
                        this.clan,
                    );

                if (clan) {
                    await clan.removeMember(this.discordid);

                    if (!clan.exists) {
                        await clan.notifyLeader(
                            new UserBindLocalization(
                                await CommandHelper.getLocale(this.discordid),
                            ).getTranslation("unbindClanDisbandNotification"),
                        );
                    }
                }
            }

            return this.bindDb.deleteOne({
                discordid: this.discordid,
            });
        }

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);

            const player: Player = (await Player.getInformation(this.uid))!;

            this.username = player.username;
        }

        return this.bindDb.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    uid: this.uid,
                    username: this.username,
                },
                $pull: {
                    previous_bind: uid,
                },
            },
        );
    }

    /**
     * Sets the clan of this Discord account.
     *
     * @param name The name of the clan.
     */
    async setClan(name: string): Promise<OperationResult> {
        this.clan = name;

        return this.bindDb.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    clan: this.clan,
                },
            },
        );
    }

    /**
     * Determines whether a uid has been binded to this Discord account.
     *
     * @param uid The uid to determine.
     */
    isUidBinded(uid: number): boolean {
        return this.previous_bind.includes(uid);
    }

    /**
     * Updates the role connection metadata of this user.
     */
    async updateRoleMetadata(): Promise<OperationResult> {
        const response: RequestResponse =
            await DiscordBackendRESTManager.updateMetadata(this.discordid);

        if (response.statusCode === 200) {
            return DatabaseManager.elainaDb.collections.userBind.updateOne(
                { discordid: this.discordid },
                {
                    $set: {
                        dailyRoleMetadataUpdateComplete: true,
                    },
                },
            );
        } else {
            return this.createOperationResult(false, "Metadata update failed");
        }
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): UserBindLocalization {
        return new UserBindLocalization(language);
    }
}
