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
import { ObjectId, UpdateFilter } from "mongodb";
import { consola } from "consola";
import {
    MapInfo,
    DroidAPIRequestBuilder,
    Precision,
    Accuracy,
    RankedStatus,
    Modes,
} from "@rian8337/osu-base";
import { Score, Player } from "@rian8337/osu-droid-utilities";
import { UserBindLocalization } from "@alice-localization/database/utils/elainaDb/UserBind/UserBindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Language } from "@alice-localization/base/Language";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { DiscordBackendRESTManager } from "@alice-utils/managers/DiscordBackendRESTManager";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { DatabaseInGamePP } from "@alice-structures/database/aliceDb/DatabaseInGamePP";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { OfficialDatabaseScore } from "@alice-database/official/schema/OfficialDatabaseScore";
import { OfficialDatabaseUser } from "@alice-database/official/schema/OfficialDatabaseUser";

/**
 * Represents a Discord user who has at least one osu!droid account bound.
 */
export class UserBind extends Manager {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * The UID of the osu!droid account bound to the user.
     */
    uid: number;

    /**
     * The username of the osu!droid account bound to the user.
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
     * The UID of osu!droid accounts that are bound to the user.
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
    calculationInfo?: RecalculationProgress<PPEntry>;

    /**
     * Whether the daily role connection metadata for this user has been completed.
     */
    dailyRoleMetadataUpdateComplete?: boolean;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    private get bindDb() {
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
            const beatmapInfo = await BeatmapManager.getBeatmap(ppEntry.hash, {
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
        const totalPP = DPPHelper.calculateFinalPerformancePoints(
            this.pp,
            this.playc,
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
     * Recalculates this player's dpp, only taking account plays from
     * the current dpp list.
     */
    async recalculateDPP(): Promise<OperationResult> {
        const newList = new Collection<string, PPEntry>();

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

            const score = await DroidHelper.getScore(
                ppEntry.uid,
                beatmapInfo.hash,
                ["id", "uid", "hash"],
            );

            if (!score) {
                continue;
            }

            const attribs =
                await DPPProcessorRESTManager.getBestScorePerformance(
                    score.uid,
                    beatmapInfo.hash,
                    PPCalculationMethod.live,
                );

            if (!attribs) {
                continue;
            }

            const { attributes } = attribs;

            await HelperFunctions.sleep(0.1);

            const [needsPersistence] = DPPHelper.insertScore(newList, [
                DPPHelper.scoreToPPEntry(
                    beatmapInfo.fullTitle,
                    score,
                    attributes,
                ),
            ]);

            if (needsPersistence) {
                if (attributes.localReplayMD5) {
                    await DPPProcessorRESTManager.persistLocalReplay(
                        ppEntry.uid,
                        beatmapInfo.hash,
                        attributes.localReplayMD5,
                    );
                } else {
                    await DPPProcessorRESTManager.persistOnlineReplay(
                        ppEntry.uid,
                        score instanceof Score ? score.scoreID : score.id,
                    );
                }
            }
        }

        this.pp = newList;
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(
            newList,
            this.playc,
        );

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

        const metadataOperation =
            await DiscordBackendRESTManager.updateMetadata(this.discordid);

        return this.createOperationResult(metadataOperation.statusCode === 200);
    }

    /**
     * Calculates this player's dpp into the in-game dpp database.
     */
    async calculateInGameDPP(): Promise<OperationResult> {
        const inGamePPDb = DatabaseManager.aliceDb.collections.inGamePP;
        const inGamePP =
            (await inGamePPDb.getFromUser(this.discordid)) ??
            inGamePPDb.defaultInstance;

        inGamePP.discordid = this.discordid;

        let newList = new Collection<string, PPEntry>();
        let playCount = 0;

        const getScores = async (
            uid: number,
            page: number,
        ): Promise<Score[]> => {
            const apiRequestBuilder = new DroidAPIRequestBuilder()
                .setEndpoint("scoresearchv2.php")
                .addParameter("uid", uid)
                .addParameter("page", page - 1);

            const data = await apiRequestBuilder.sendRequest();

            if (data.statusCode !== 200) {
                return [];
            }

            const entries = data.data.toString("utf-8").split("<br>");

            entries.shift();

            return entries.map((v) => new Score().fillInformation(v));
        };

        for (let i = 0; i < this.previous_bind.length; ++i) {
            const uid = this.previous_bind[i];

            if (
                await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
                    uid,
                )
            ) {
                continue;
            }

            if (
                inGamePP.calculationInfo &&
                uid !== inGamePP.calculationInfo.uid
            ) {
                continue;
            }

            const player = await DroidHelper.getPlayer(uid, ["id"]);
            if (!player) {
                continue;
            }

            let page = 0;

            if (inGamePP.calculationInfo) {
                page = inGamePP.calculationInfo.page;
                playCount = inGamePP.calculationInfo.playc;
                newList = new Collection(
                    inGamePP.calculationInfo.currentPPEntries.map((v) => [
                        v.hash,
                        v,
                    ]),
                );
            }

            let scores: Score[];

            while ((scores = await getScores(uid, ++page)).length) {
                const scoreCount = scores.length;

                consola.info(
                    `Calculating ${scoreCount} scores from page ${page} for prototype`,
                );

                let score: Score | undefined;

                while ((score = scores.shift())) {
                    const beatmapInfo: MapInfo | null =
                        await BeatmapManager.getBeatmap(score.hash, {
                            checkFile: false,
                        }).catch(() => null);

                    if (!beatmapInfo) {
                        continue;
                    }

                    if (
                        beatmapInfo.approved !== RankedStatus.ranked &&
                        beatmapInfo.approved !== RankedStatus.approved
                    ) {
                        continue;
                    }

                    const attribs =
                        await DPPProcessorRESTManager.getBestScorePerformance(
                            score.uid,
                            score.hash,
                            PPCalculationMethod.live,
                        );

                    if (!attribs) {
                        continue;
                    }

                    ++playCount;

                    const { difficulty, performance, params } =
                        attribs.attributes;
                    const accuracy = new Accuracy(params.accuracy);

                    const ppEntry: PPEntry = {
                        uid: score.uid,
                        hash: beatmapInfo.hash,
                        title: beatmapInfo.fullTitle,
                        pp: NumberHelper.round(performance.total, 2),
                        mods: difficulty.mods,
                        accuracy: NumberHelper.round(accuracy.value() * 100, 2),
                        combo: params.combo,
                        miss: accuracy.nmiss,
                        speedMultiplier:
                            params.customSpeedMultiplier !== 1
                                ? params.customSpeedMultiplier
                                : undefined,
                    };

                    DPPHelper.insertScore(newList, [ppEntry], 100);
                }

                inGamePP.calculationInfo = {
                    uid: uid,
                    page: page,
                    playc: playCount,
                    currentPPEntries: [...newList.values()],
                };

                inGamePP.pptotal = DPPHelper.calculateFinalPerformancePoints(
                    newList,
                    playCount,
                );

                await inGamePPDb.updateOne(
                    { discordid: this.discordid },
                    {
                        $set: {
                            lastUpdate: Date.now(),
                            calculationInfo: inGamePP.calculationInfo,
                            playc: playCount,
                            pp: inGamePP.calculationInfo.currentPPEntries,
                            pptotal: inGamePP.pptotal,
                            prevpptotal: this.pptotal,
                        },
                        $setOnInsert: {
                            previous_bind: this.previous_bind,
                            uid: this.uid,
                            username: this.username,
                        },
                    },
                    { upsert: true },
                );
            }

            if (this.previous_bind[i + 1]) {
                inGamePP.calculationInfo = {
                    uid: this.previous_bind[i + 1],
                    page: 0,
                    playc: playCount,
                    currentPPEntries: [...newList.values()],
                };

                inGamePP.pptotal = DPPHelper.calculateFinalPerformancePoints(
                    newList,
                    playCount,
                );

                await inGamePPDb.updateOne(
                    { discordid: this.discordid },
                    {
                        $set: {
                            lastUpdate: Date.now(),
                            calculationInfo: inGamePP.calculationInfo,
                            pp: inGamePP.calculationInfo.currentPPEntries,
                            pptotal: inGamePP.pptotal,
                            prevpptotal: this.pptotal,
                        },
                        $setOnInsert: {
                            previous_bind: this.previous_bind,
                            uid: this.uid,
                            username: this.username,
                        },
                    },
                );
            }
        }

        inGamePP.playc = playCount;
        inGamePP.pp = newList;
        inGamePP.pptotal = DPPHelper.calculateFinalPerformancePoints(
            newList,
            playCount,
        );

        await this.bindDb.updateOne(
            {
                discordid: this.discordid,
            },
            {
                $set: {
                    dppRecalcComplete: true,
                },
            },
        );

        const query: UpdateFilter<DatabaseInGamePP> = {
            $set: {
                lastUpdate: Date.now(),
                playc: playCount,
                pp: [...newList.values()],
                pptotal: inGamePP.pptotal,
                prevpptotal: this.pptotal,
                scanDone: true,
            },
            $setOnInsert: {
                previous_bind: this.previous_bind,
                uid: this.uid,
                username: this.username,
            },
            $unset: {
                calculationInfo: "",
            },
        };

        return inGamePPDb.updateOne({ discordid: this.discordid }, query, {
            upsert: true,
        });
    }

    /**
     * Calculates this player's dpp into the prototype dpp database.
     *
     * @param reworkType The rework type of the prototype.
     */
    async calculatePrototypeDPP(reworkType: string): Promise<OperationResult> {
        const currentList = new Collection<string, PPEntry>();
        const newList = new Collection<string, PrototypePPEntry>();

        for (const ppEntry of this.pp.values()) {
            const score = await DroidHelper.getScore(
                ppEntry.uid,
                ppEntry.hash,
                ["id", "uid", "hash", "mode"],
            );

            if (!score) {
                continue;
            }

            const beatmapInfo = await BeatmapManager.getBeatmap(score.hash, {
                checkFile: false,
            });

            if (!beatmapInfo) {
                continue;
            }

            const scoreId = score instanceof Score ? score.scoreID : score.id;
            const liveAttribs =
                await DPPProcessorRESTManager.getOnlineScoreAttributes(
                    scoreId,
                    Modes.droid,
                    PPCalculationMethod.live,
                );

            if (!liveAttribs) {
                continue;
            }

            const rebalAttribs =
                await DPPProcessorRESTManager.getOnlineScoreAttributes(
                    scoreId,
                    Modes.droid,
                    PPCalculationMethod.rebalance,
                );

            if (!rebalAttribs) {
                continue;
            }

            const { performance: perfResult, params } = liveAttribs.attributes;
            const { performance: rebalPerfResult, params: rebalParams } =
                rebalAttribs.attributes;

            const accuracy = new Accuracy(params.accuracy);

            const currentEntry: PPEntry = {
                uid: score.uid,
                hash: beatmapInfo.hash,
                title: beatmapInfo.fullTitle,
                pp: NumberHelper.round(perfResult.total, 2),
                mods: liveAttribs.attributes.difficulty.mods,
                accuracy: NumberHelper.round(accuracy.value() * 100, 2),
                combo: params.combo,
                miss: accuracy.nmiss,
            };

            const prototypeEntry: PrototypePPEntry = {
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
                mods: rebalAttribs.attributes.difficulty.mods,
                accuracy: NumberHelper.round(accuracy.value() * 100, 2),
                combo: params.combo,
                miss: accuracy.nmiss,
                speedMultiplier:
                    rebalParams.customSpeedMultiplier !== 1
                        ? rebalParams.customSpeedMultiplier
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
                overallDifficulty:
                    rebalAttribs.attributes.difficulty.overallDifficulty,
                hit300: accuracy.n300,
                hit100: accuracy.n100,
                hit50: accuracy.n50,
                aimSliderCheesePenalty: rebalPerfResult.aimSliderCheesePenalty,
                flashlightSliderCheesePenalty:
                    rebalPerfResult.flashlightSliderCheesePenalty,
                visualSliderCheesePenalty:
                    rebalPerfResult.visualSliderCheesePenalty,
                speedNoteCount:
                    rebalAttribs.attributes.difficulty.speedNoteCount,
                liveTapPenalty: params.tapPenalty,
                rebalanceTapPenalty: rebalParams.tapPenalty,
                averageBPM:
                    60000 /
                    4 /
                    rebalAttribs.attributes.difficulty.averageSpeedDeltaTime,
            };

            consola.info(
                `${beatmapInfo.fullTitle} ${score instanceof Score ? score.completeModString : DroidHelper.getCompleteModString(score.mode)}: ${prototypeEntry.prevPP} ⮕  ${prototypeEntry.pp}`,
            );

            currentList.set(ppEntry.hash, currentEntry);
            newList.set(ppEntry.hash, prototypeEntry);
        }

        currentList.sort((a, b) => b.pp - a.pp);
        newList.sort((a, b) => b.pp - a.pp);

        const currentTotal = DPPHelper.calculateFinalPerformancePoints(
            currentList,
            this.playc,
        );
        const newTotal = DPPHelper.calculateFinalPerformancePoints(
            newList,
            this.playc,
        );

        consola.info(`${currentTotal.toFixed(2)} ⮕  ${newTotal.toFixed(2)}`);

        return DatabaseManager.aliceDb.collections.prototypePP.updateOne(
            {
                discordid: this.discordid,
                reworkType: reworkType,
            },
            {
                $set: {
                    pp: [...newList.values()],
                    pptotal: newTotal,
                    prevpptotal: currentTotal,
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
     * @param isDPPRecalc Whether this recalculation is a part of a full recalculation triggered by bot owners. Defaults to `false`.
     */
    async recalculateAllScores(isDPPRecalc = false): Promise<OperationResult> {
        let newList = new Collection<string, PPEntry>();
        let playCount = 0;

        for (let i = 0; i < this.previous_bind.length; ++i) {
            const uid = this.previous_bind[i];

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

            const player = await DroidHelper.getPlayer(uid, ["id"]);
            if (!player) {
                continue;
            }

            let page = 0;

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

            let scores:
                | Pick<OfficialDatabaseScore, "id" | "uid" | "hash">[]
                | Score[];

            while (
                (scores = await DroidHelper.getScores(
                    uid,
                    ++page,
                    undefined,
                    undefined,
                    ["id", "uid", "hash"],
                )).length
            ) {
                const scoreCount = scores.length;

                if (isDPPRecalc) {
                    consola.info(
                        `Calculating ${scoreCount} scores from page ${page} for live`,
                    );
                }

                let score:
                    | Pick<OfficialDatabaseScore, "id" | "uid" | "hash">
                    | Score
                    | undefined;

                while ((score = scores.shift())) {
                    const beatmapInfo: MapInfo | null =
                        await BeatmapManager.getBeatmap(score.hash, {
                            checkFile: false,
                        }).catch(() => null);

                    if (!beatmapInfo) {
                        continue;
                    }

                    const submissionValidity =
                        await DPPHelper.checkSubmissionValidity(beatmapInfo);

                    if (submissionValidity !== DPPSubmissionValidity.valid) {
                        continue;
                    }

                    const attribs =
                        await DPPProcessorRESTManager.getBestScorePerformance(
                            score.uid,
                            beatmapInfo.hash,
                            PPCalculationMethod.live,
                        );

                    if (!attribs) {
                        continue;
                    }

                    const { attributes } = attribs;

                    this.playc = ++playCount;

                    const ppEntry = DPPHelper.scoreToPPEntry(
                        beatmapInfo.fullTitle,
                        score,
                        attributes,
                    );

                    const [needsPersistence] = DPPHelper.insertScore(newList, [
                        ppEntry,
                    ]);

                    if (needsPersistence) {
                        if (attributes.localReplayMD5) {
                            await DPPProcessorRESTManager.persistLocalReplay(
                                ppEntry.uid,
                                beatmapInfo.hash,
                                attributes.localReplayMD5,
                            );
                        } else {
                            await DPPProcessorRESTManager.persistOnlineReplay(
                                ppEntry.uid,
                                score instanceof Score
                                    ? score.scoreID
                                    : score.id,
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
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(
            newList,
            this.playc,
        );
        this.weightedAccuracy = DPPHelper.calculateWeightedAccuracy(this.pp);

        const query: UpdateFilter<DatabaseUserBind> = {
            $set: {
                pp: [...this.pp.values()],
                pptotal: this.pptotal,
                playc: this.playc,
                weightedAccuracy: this.weightedAccuracy,
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

        await DatabaseManager.aliceDb.collections.inGamePP.updateOne(
            { discordid: this.discordid },
            {
                $set: {
                    playc: this.playc,
                    prevpptotal: this.pptotal,
                },
                $setOnInsert: {
                    previous_bind: this.previous_bind,
                    uid: this.uid,
                    username: this.username,
                    pptotal: 0,
                    pp: [],
                    lastUpdate: Date.now(),
                },
            },
            { upsert: true },
        );

        const metadataOperation =
            await DiscordBackendRESTManager.updateMetadata(this.discordid);

        return this.createOperationResult(metadataOperation.statusCode === 200);
    }

    /**
     * Moves the bind of a bound osu!droid account in this Discord account to another
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
        const localization = this.getLocalization(language);

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

        const otherBindInfo = await this.bindDb.getFromUser(to, {
            projection: {
                _id: 0,
                pp: 1,
                playc: 1,
                previous_bind: 1,
            },
        });

        const otherPreviousBind = otherBindInfo?.previous_bind ?? [];

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

        const player = await DroidHelper.getPlayer(uid, ["username"]);

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
            await this.bindDb.deleteOne({ discordid: this.discordid });

            await DatabaseManager.aliceDb.collections.nameChange.updateOne(
                { discordid: this.discordid },
                { $set: { discordid: to } },
            );

            // Remove the new Discord account's account transfer information.
            await DatabaseManager.aliceDb.collections.accountTransfer.deleteOne(
                { discordId: to },
            );

            await DatabaseManager.aliceDb.collections.accountTransfer.updateOne(
                { discordId: this.discordid },
                {
                    $set: { discordId: to },
                    $push: { transferList: uid },
                    $setOnInsert: {
                        // Take the smallest uid as transfer target.
                        transferUid: Math.min(...otherPreviousBind),
                    },
                },
                { upsert: true },
            );

            if (otherBindInfo?.pp) {
                this.playc += this.pp.difference(otherBindInfo.pp).size;

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
                            this.playc,
                        ),
                        playc: this.playc,
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
                        dppScanComplete: this.dppScanComplete ?? undefined,
                        dppRecalcComplete: this.dppRecalcComplete ?? undefined,
                        calculationInfo: this.calculationInfo ?? undefined,
                    },
                },
                { upsert: true },
            );
        } else {
            const newPPEntries = this.pp.filter((v) => v.uid === uid);
            const oldPPEntries = this.pp.difference(newPPEntries);

            this.playc = Math.max(
                oldPPEntries.size,
                this.playc - newPPEntries.size,
            );

            await this.removeAccountFromTransfer(uid);

            if (otherPreviousBind.length > 1) {
                await DatabaseManager.aliceDb.collections.accountTransfer.updateOne(
                    { discordId: to },
                    {
                        $push: { transferList: uid },
                        $setOnInsert: {
                            // Take the smallest uid as transfer target.
                            transferUid: Math.min(...otherPreviousBind),
                        },
                    },
                    { upsert: true },
                );
            }

            await this.bindDb.updateOne(
                { discordid: this.discordid },
                {
                    $pull: {
                        previous_bind: uid,
                    },
                    $set: {
                        uid: this.uid,
                        pptotal: DPPHelper.calculateFinalPerformancePoints(
                            oldPPEntries,
                            this.playc,
                        ),
                        playc: this.playc,
                        pp: [...oldPPEntries.values()],
                        weightedAccuracy:
                            DPPHelper.calculateWeightedAccuracy(oldPPEntries),
                    },
                },
            );

            const otherPlayCount =
                (otherBindInfo?.playc ?? 0) + newPPEntries.size;

            await this.bindDb.updateOne(
                { discordid: to },
                {
                    $set: {
                        previous_bind: otherPreviousBind,
                        pptotal: DPPHelper.calculateFinalPerformancePoints(
                            newPPEntries,
                            otherPlayCount,
                        ),
                        playc: otherPlayCount,
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
     * @param player The player.
     * @param language The locale of the user who attempted to bind. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async bind(
        player: Pick<OfficialDatabaseUser, "id" | "username"> | Player,
        language?: Language,
    ): Promise<OperationResult>;

    async bind(
        uidOrUsernameOrPlayer:
            | string
            | number
            | Pick<OfficialDatabaseUser, "id" | "username">
            | Player,
        language: Language = "en",
    ): Promise<OperationResult> {
        const player =
            uidOrUsernameOrPlayer instanceof Player
                ? uidOrUsernameOrPlayer
                : typeof uidOrUsernameOrPlayer === "string" ||
                    typeof uidOrUsernameOrPlayer === "number"
                  ? await DroidHelper.getPlayer(uidOrUsernameOrPlayer, [
                        "id",
                        "username",
                    ])
                  : uidOrUsernameOrPlayer;

        const localization = this.getLocalization(language);

        if (!player) {
            return this.createOperationResult(
                false,
                localization.getTranslation("playerWithUidOrUsernameNotFound"),
            );
        }

        const uid = player instanceof Player ? player.uid : player.id;

        if (!this.isUidBinded(uid)) {
            if (this.previous_bind.length >= 2) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("bindLimitReached"),
                );
            }

            this.previous_bind.push(uid);
        }

        this.uid = uid;
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
        const localization = this.getLocalization(language);

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
                const clan =
                    await DatabaseManager.elainaDb.collections.clan.getFromName(
                        this.clan,
                    );

                if (clan) {
                    await clan.removeMember(this.discordid);

                    if (!clan.exists) {
                        await clan.notifyLeader(
                            new UserBindLocalization(
                                CommandHelper.getLocale(this.discordid),
                            ).getTranslation("unbindClanDisbandNotification"),
                        );
                    }
                }
            }

            await DatabaseManager.aliceDb.collections.accountTransfer.deleteOne(
                { discordId: this.discordid },
            );

            return this.bindDb.deleteOne({
                discordid: this.discordid,
            });
        }

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);

            const player = (await DroidHelper.getPlayer(this.uid, [
                "username",
            ]))!;

            this.username = player.username;
        }

        await this.removeAccountFromTransfer(uid);

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
     * Determines whether a uid has been bound to this Discord account.
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
        const response = await DiscordBackendRESTManager.updateMetadata(
            this.discordid,
        );

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

    private async removeAccountFromTransfer(uid: number) {
        const accountTransfer =
            await DatabaseManager.aliceDb.collections.accountTransfer.getOne(
                { discordId: this.discordid },
                { projection: { _id: 0, discordId: 0 } },
            );

        if (accountTransfer) {
            await DatabaseManager.aliceDb.collections.accountTransfer.updateOne(
                { discordId: this.discordid },
                {
                    $pull: { transferList: uid },
                    $set: {
                        transferUid:
                            accountTransfer.transferUid === uid
                                ? // Take the smallest uid as transfer target.
                                  Math.min(
                                      ...accountTransfer.transferList.filter(
                                          (v) => v !== uid,
                                      ),
                                  )
                                : uid,
                    },
                },
            );
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
