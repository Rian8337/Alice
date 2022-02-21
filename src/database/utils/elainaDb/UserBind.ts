import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseUserBind } from "@alice-interfaces/database/elainaDb/DatabaseUserBind";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { PrototypePPEntry } from "@alice-interfaces/dpp/PrototypePPEntry";
import { RecalculationProgress } from "@alice-interfaces/dpp/RecalculationProgress";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { RankedScoreHelper } from "@alice-utils/helpers/RankedScoreHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Collection, Snowflake } from "discord.js";
import { Clan } from "./Clan";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ObjectId, UpdateFilter } from "mongodb";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import {
    MapInfo,
    DroidAPIRequestBuilder,
    Precision,
    RequestResponse,
} from "@rian8337/osu-base";
import { DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import { DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator } from "@rian8337/osu-rebalance-difficulty-calculator";
import { Score, Player } from "@rian8337/osu-droid-utilities";
import { UserBindLocalization } from "@alice-localization/database/utils/elainaDb/UserBindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Language } from "@alice-localization/base/Language";

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
     * The epoch time at which the user can rejoin his/her old clan, in seconds.
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
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseUserBind = DatabaseManager.elainaDb?.collections.userBind
            .defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.uid = data.uid;
        this.username = data.username;
        this.pptotal = data.pptotal;
        this.playc = data.playc;
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
    }

    /**
     * Checks whether this player is dpp-banned.
     */
    async isDPPBanned(): Promise<boolean> {
        for (const uid of this.previous_bind) {
            if (
                await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
                    uid
                )
            ) {
                return true;
            }
        }

        return false;
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

            return DatabaseManager.elainaDb.collections.userBind.update(
                { discordid: this.discordid },
                {
                    $set: {
                        pp: [],
                        pptotal: 0,
                        playc: 0,
                        dppScanComplete: true,
                    },
                }
            );
        }

        for (const ppEntry of this.pp.values()) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                ppEntry.hash,
                false
            );

            await HelperFunctions.sleep(0.2);

            if (
                !beatmapInfo ||
                (await DPPHelper.checkSubmissionValidity(beatmapInfo)) !==
                    DPPSubmissionValidity.VALID
            ) {
                this.pp.delete(ppEntry.hash);
                this.playc = Math.max(0, this.playc - 1);
            }
        }

        // Even if there are no deletions, still update to keep track of scan progress.
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(this.pp);

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    pptotal: this.pptotal,
                    pp: [...this.pp.values()],
                    playc: this.playc,
                    dppScanComplete: true,
                },
            }
        );
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
        playCountIncrement: number
    ): Promise<OperationResult> {
        this.pp = list;

        this.pp.sort((a, b) => {
            return b.pp - a.pp;
        });

        this.playc += Math.max(0, playCountIncrement);

        const finalPP: number = DPPHelper.calculateFinalPerformancePoints(list);

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    pptotal: finalPP,
                    pp: [...this.pp.values()],
                },
                $inc: {
                    playc: Math.max(0, playCountIncrement),
                },
            }
        );
    }

    /**
     * Recalculates this player's dpp, only taking account plays from
     * the current dpp list.
     */
    async recalculateDPP(): Promise<OperationResult> {
        const newList: Collection<string, PPEntry> = new Collection();

        for (const ppEntry of this.pp.values()) {
            const score: Score | null = await this.getScoreRelativeToPP(
                ppEntry
            );

            if (!score) {
                continue;
            }

            if (
                (await DPPHelper.checkSubmissionValidity(score)) !==
                DPPSubmissionValidity.VALID
            ) {
                continue;
            }

            await HelperFunctions.sleep(0.1);

            const calcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
                await DroidBeatmapDifficultyHelper.calculateScorePerformance(
                    score
                );

            if (!calcResult) {
                continue;
            }

            await HelperFunctions.sleep(0.2);

            DPPHelper.insertScore(newList, score, calcResult);
        }

        this.pp = newList;
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(newList);

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    pp: [...this.pp.values()],
                    pptotal: this.pptotal,
                    dppRecalcComplete: true,
                },
            }
        );
    }

    /**
     * Calculates this player's dpp into the prototype dpp database.
     */
    async calculatePrototypeDPP(): Promise<OperationResult> {
        const newList: Collection<string, PrototypePPEntry> = new Collection();

        for (const ppEntry of this.pp.values()) {
            const score: Score | null = await this.getScoreRelativeToPP(
                ppEntry
            );

            if (!score) {
                continue;
            }

            if (
                (await DPPHelper.checkSubmissionValidity(score)) !==
                DPPSubmissionValidity.VALID
            ) {
                continue;
            }

            await HelperFunctions.sleep(0.1);

            const calcResult: RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator> | null =
                await DroidBeatmapDifficultyHelper.calculateScoreRebalancePerformance(
                    score
                );

            if (!calcResult) {
                continue;
            }

            await HelperFunctions.sleep(0.2);

            const entry: PrototypePPEntry = {
                hash: calcResult.map.hash,
                title: calcResult.map.fullTitle,
                pp: parseFloat(calcResult.result.total.toFixed(2)),
                prevPP: ppEntry.pp,
                mods: score.mods.map((v) => v.acronym).join(""),
                accuracy: parseFloat((score.accuracy.value() * 100).toFixed(2)),
                combo: score.combo,
                miss: score.accuracy.nmiss,
                scoreID: score.scoreID,
            };

            this.client.logger.info(
                `${calcResult.map.fullTitle}${
                    entry.mods ? ` +${entry.mods}` : ""
                }: ${entry.prevPP} ⮕  ${entry.pp}`
            );

            newList.set(ppEntry.hash, entry);
        }

        this.client.logger.info(
            `${this.pptotal} ⮕  ${DPPHelper.calculateFinalPerformancePoints(
                newList
            ).toFixed(2)}`
        );

        return DatabaseManager.aliceDb.collections.prototypePP.update(
            { discordid: this.discordid },
            {
                $set: {
                    pp: [...newList.values()],
                    pptotal: DPPHelper.calculateFinalPerformancePoints(newList),
                    prevpptotal: this.pptotal,
                    lastUpdate: Date.now(),
                    previous_bind: this.previous_bind,
                    uid: this.uid,
                    username: this.username,
                    scanDone: true,
                },
            },
            { upsert: true }
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
        isDPPRecalc: boolean = false
    ): Promise<OperationResult> {
        let newList: Collection<string, PPEntry> = new Collection();

        this.playc = 0;

        const getScores = async (
            uid: number,
            page: number
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
                    uid
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

            const player: Player = await Player.getInformation({ uid: uid });

            if (!player.username) {
                continue;
            }

            let page = 0;

            if (isDPPRecalc && this.calculationInfo) {
                page = this.calculationInfo.page;

                newList = new Collection(
                    this.calculationInfo.currentPPEntries.map((v) => [
                        v.hash,
                        v,
                    ])
                );
            } else {
                // Do manual operations to reduce memory usage (we don't need to cache
                // submitted scores)
                await DatabaseManager.aliceDb.collections.rankedScore.delete({
                    uid: uid,
                });
            }

            let scores: Score[];

            while ((scores = await getScores(uid, ++page)).length) {
                const scoreCount: number = scores.length;

                if (isDPPRecalc) {
                    this.client.logger.info(
                        `Calculating ${scoreCount} scores from page ${page}`
                    );
                }

                let calculatedCount: number = 0;

                const rankedScoreCollection: Collection<string, number> =
                    new Collection();

                let score: Score | undefined;

                while ((score = scores.shift())) {
                    const beatmapInfo: MapInfo | null =
                        await BeatmapManager.getBeatmap(
                            score.hash,
                            false
                        ).catch(() => null);

                    if (isDPPRecalc) {
                        this.client.logger.info(
                            `${++calculatedCount}/${scoreCount} scores calculated`
                        );
                    }

                    if (!beatmapInfo) {
                        continue;
                    }

                    if (
                        (await DPPHelper.checkSubmissionValidity(score)) ===
                        DPPSubmissionValidity.VALID
                    ) {
                        const calcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
                            await DroidBeatmapDifficultyHelper.calculateScorePerformance(
                                score
                            );

                        if (calcResult) {
                            ++this.playc;

                            DPPHelper.insertScore(newList, score, calcResult);
                        }
                    }

                    if (
                        RankedScoreHelper.isBeatmapEligible(
                            beatmapInfo.approved
                        )
                    ) {
                        rankedScoreCollection.set(
                            beatmapInfo.hash,
                            score.score
                        );
                    }
                }

                await DatabaseManager.aliceDb.collections.rankedScore.update(
                    { uid: uid },
                    {
                        $inc: {
                            score: rankedScoreCollection.reduce(
                                (acc, value) => acc + value,
                                0
                            ),
                            playc: rankedScoreCollection.size,
                        },
                        $addToSet: {
                            scorelist: {
                                $each: RankedScoreHelper.toArray(
                                    rankedScoreCollection
                                ),
                            },
                        },
                        $setOnInsert: {
                            username: player.username,
                        },
                    },
                    { upsert: true }
                );

                if (isDPPRecalc) {
                    this.calculationInfo = {
                        uid: uid,
                        page: page,
                        currentPPEntries: [...newList.values()],
                    };

                    await DatabaseManager.elainaDb.collections.userBind.update(
                        { discordid: this.discordid },
                        {
                            $set: {
                                calculationInfo: this.calculationInfo,
                            },
                        }
                    );
                }
            }

            if (isDPPRecalc && this.previous_bind[i + 1]) {
                this.calculationInfo = {
                    uid: this.previous_bind[i + 1],
                    page: 0,
                    currentPPEntries: [...newList.values()],
                };

                await DatabaseManager.elainaDb.collections.userBind.update(
                    { discordid: this.discordid },
                    {
                        $set: {
                            calculationInfo: this.calculationInfo,
                        },
                    }
                );
            }
        }

        this.pp = newList;
        this.pptotal = DPPHelper.calculateFinalPerformancePoints(newList);

        const query: UpdateFilter<DatabaseUserBind> = {
            $set: {
                pp: [...this.pp.values()],
                pptotal: this.pptotal,
                playc: this.playc,
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

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            query
        );
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
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: UserBindLocalization =
            this.getLocalization(language);

        if (!this.previous_bind.includes(uid)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("uidNotBindedToAccount")
            );
        }

        if (this.discordid === to) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cannotRebindToSameAccount")
            );
        }

        const otherBindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(to);

        const otherPreviousBind: number[] = otherBindInfo?.previous_bind ?? [];

        if (otherPreviousBind.length >= 2) {
            return this.createOperationResult(
                false,
                localization.getTranslation("bindLimitReachedInOtherAccount")
            );
        }

        this.previous_bind.splice(this.previous_bind.indexOf(uid), 1);

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);
        }

        const player: Player = await Player.getInformation({ uid: uid });

        if (!player.username) {
            this.previous_bind.push(uid);

            return this.createOperationResult(
                false,
                localization.getTranslation("playerNotFound")
            );
        }

        this.username = player.username;

        otherPreviousBind.push(uid);

        const dbManager: UserBindCollectionManager =
            DatabaseManager.elainaDb.collections.userBind;

        if (this.previous_bind.length === 0) {
            await dbManager.delete({
                discordid: this.discordid,
            });

            await DatabaseManager.aliceDb.collections.nameChange.update(
                { discordid: this.discordid },
                {
                    $set: {
                        discordid: to,
                    },
                }
            );

            this.discordid = to;

            await dbManager.update(
                { discordid: this.discordid },
                {
                    $set: {
                        previous_bind: otherPreviousBind,
                    },
                    $setOnInsert: {
                        uid: uid,
                        username: player.username,
                        pptotal: this.pptotal,
                        playc: this.playc,
                        pp: [...this.pp.values()],
                        clan: this.clan,
                        oldclan: this.oldclan,
                        oldjoincooldown: this.oldjoincooldown,
                        hasAskedForRecalc: this.hasAskedForRecalc,
                        dppScanComplete: this.dppScanComplete,
                        dppRecalcComplete: this.dppRecalcComplete,
                        calculationInfo: this.calculationInfo,
                    },
                },
                { upsert: true }
            );
        } else {
            await dbManager.update(
                { discordid: this.discordid },
                {
                    $pull: {
                        previous_bind: uid,
                    },
                    $set: {
                        uid: this.uid,
                    },
                }
            );

            await dbManager.update(
                { discordid: to },
                {
                    $set: {
                        previous_bind: otherPreviousBind,
                    },
                    $setOnInsert: {
                        uid: uid,
                        username: player.username,
                        hasAskedForRecalc: false,
                        pptotal: 0,
                        playc: 0,
                        pp: [],
                        clan: "",
                    },
                },
                { upsert: true }
            );
        }

        return DatabaseManager.aliceDb.collections.playerInfo.update(
            { uid: uid },
            {
                $set: {
                    discordid: to,
                },
            }
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
        language: Language = "en"
    ): Promise<OperationResult> {
        const player: Player =
            uidOrUsernameOrPlayer instanceof Player
                ? uidOrUsernameOrPlayer
                : await Player.getInformation(
                      typeof uidOrUsernameOrPlayer === "string"
                          ? { username: uidOrUsernameOrPlayer }
                          : { uid: uidOrUsernameOrPlayer }
                  );

        const localization: UserBindLocalization =
            this.getLocalization(language);

        if (!player.username || !player.uid) {
            return this.createOperationResult(
                false,
                localization.getTranslation("playerWithUidOrUsernameNotFound")
            );
        }

        if (!this.isUidBinded(player.uid)) {
            if (this.previous_bind.length >= 2) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("bindLimitReached")
                );
            }

            this.previous_bind.push(player.uid);
        }

        this.uid = player.uid;
        this.username = player.username;

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    username: this.username,
                    uid: this.uid,
                    previous_bind: this.previous_bind,
                },
            }
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
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: UserBindLocalization =
            this.getLocalization(language);

        if (!this.isUidBinded(uid)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("uidNotBindedToAccount")
            );
        }

        this.previous_bind.splice(this.previous_bind.indexOf(uid), 1);

        if (this.previous_bind.length === 0) {
            // Kick the user from any clan
            if (this.clan) {
                const clan: Clan | null =
                    await DatabaseManager.elainaDb.collections.clan.getFromName(
                        this.clan
                    );

                if (clan) {
                    await clan.removeMember(this.discordid);

                    if (!clan.exists) {
                        await clan.notifyLeader(
                            new UserBindLocalization(
                                await CommandHelper.getLocale(this.discordid)
                            ).getTranslation("unbindClanDisbandNotification")
                        );
                    }
                }
            }

            return DatabaseManager.elainaDb.collections.userBind.delete({
                discordid: this.discordid,
            });
        }

        if (this.uid === uid) {
            this.uid = ArrayHelper.getRandomArrayElement(this.previous_bind);
        }

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    uid: this.uid,
                    username: this.username,
                },
                $pull: {
                    previous_bind: uid,
                },
            }
        );
    }

    /**
     * Sets the clan of this Discord account.
     *
     * @param name The name of the clan.
     */
    async setClan(name: string): Promise<OperationResult> {
        this.clan = name;

        return DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: this.discordid },
            {
                $set: {
                    clan: this.clan,
                },
            }
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
     * Gets a score from this binded Discord account with respect to a pp entry.
     *
     * @param ppEntry The pp entry to retrieve.
     * @returns The score, `null` if not found.
     */
    private async getScoreRelativeToPP(
        ppEntry: PPEntry
    ): Promise<Score | null> {
        for (const uid of this.previous_bind) {
            const score: Score = await Score.getFromHash({
                uid: uid,
                hash: ppEntry.hash,
            });

            // Check for score equality.
            if (
                score.scoreID === ppEntry.scoreID &&
                score.combo === ppEntry.combo &&
                Precision.almostEqualsNumber(
                    parseFloat((score.accuracy.value() * 100).toFixed(2)),
                    ppEntry.accuracy
                ) &&
                score.accuracy.nmiss === ppEntry.miss &&
                StringHelper.sortAlphabet(
                    score.mods.map((v) => v.acronym).join("")
                ) === StringHelper.sortAlphabet(ppEntry.mods)
            ) {
                return score;
            }
        }

        return null;
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language
     * @returns
     */
    private getLocalization(language: Language): UserBindLocalization {
        return new UserBindLocalization(language);
    }
}
