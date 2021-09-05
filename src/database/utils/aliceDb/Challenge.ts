import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Bonus } from "@alice-interfaces/challenge/Bonus";
import { BonusDescription } from "@alice-interfaces/challenge/BonusDescription";
import { ChallengeOperationResult } from "@alice-interfaces/challenge/ChallengeOperationResult";
import { PassRequirement } from "@alice-interfaces/challenge/PassRequirement";
import { DatabaseChallenge } from "@alice-interfaces/database/aliceDb/DatabaseChallenge";
import { PerformanceCalculationResult } from "@alice-interfaces/utils/PerformanceCalculationResult";
import { BonusID } from "@alice-types/challenge/BonusID";
import { ChallengeStatusType } from "@alice-types/challenge/ChallengeStatusType";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { Collection, GuildEmoji, MessageOptions, Snowflake, TextChannel } from "discord.js";
import { ObjectId } from "mongodb";
import { Accuracy, Beatmap, Circle, DroidHitWindow, HitErrorInformation, HitObject, hitResult, MapInfo, MapStats, Mod, ModEasy, modes, ModHalfTime, ModNoFail, ModPrecise, ModUtil, ReplayAnalyzer, ReplayData, ReplayObjectData, Score } from "osu-droid";
import { Manager } from "../../../utils/base/Manager";
import { BeatmapDifficultyHelper } from "../../../utils/helpers/BeatmapDifficultyHelper";
import { DateTimeFormatHelper } from "../../../utils/helpers/DateTimeFormatHelper";
import { StringHelper } from "../../../utils/helpers/StringHelper";
import { BeatmapManager } from "../../../utils/managers/BeatmapManager";
import { UserBind } from "../elainaDb/UserBind";

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
     * Whether the challenge has started.
     */
    get hasStarted(): boolean {
        return this.status === "ongoing";
    }

    /**
     * Whether the challenge has finished.
     */
    get hasFinished(): boolean {
        return this.status === "finished";
    }

    private readonly challengeChannelID: Snowflake = "669221772083724318";

    constructor(data: DatabaseChallenge = DatabaseManager.aliceDb.collections.challenge.defaultDocument) {
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
     * @returns An object containing information about the operation.
     */
    start(): Promise<ChallengeOperationResult> {
        return new Promise(async resolve => {
            if (this.status !== "scheduled") {
                return resolve(this.createOperationResult(false, "challenge is not scheduled"));
            }

            // Check if any challenges are ongoing
            if (await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(this.type)) {
                return resolve(this.createOperationResult(false, "a challenge is still ongoing"));
            }

            await DatabaseManager.aliceDb.collections.challenge.update(
                { challengeid: this.challengeid },
                {
                    $set: {
                        status: "ongoing",
                        timelimit: Math.floor(Date.now() / 1000) + 86400 * (this.isWeekly ? 7 : 1)
                    }
                }
            );

            const notificationChannel: TextChannel = <TextChannel> await this.client.channels.fetch(this.challengeChannelID);

            const challengeEmbedOptions: MessageOptions = await EmbedCreator.createChallengeEmbed(this, this.isWeekly ? "#af46db" : "#e3b32d");

            await notificationChannel.send({
                content: MessageCreator.createAccept(`Successfully started challenge \`${this.challengeid}\`.`),
                ...challengeEmbedOptions
            });

            resolve(this.createOperationResult(true));
        });
    }

    /**
     * Ends the challenge.
     * 
     * @param force Whether to force end the challenge.
     * @returns An object containing information about the operation.
     */
    end(force?: boolean): Promise<ChallengeOperationResult> {
        return new Promise(async resolve => {
            if (!this.hasStarted) {
                return resolve(this.createOperationResult(false, "challenge is not ongoing"));
            }

            if (!force && DateTimeFormatHelper.getTimeDifference(this.timelimit * 1000) > 0) {
                return resolve(this.createOperationResult(false, "not the time to end challenge yet"));
            }

            await DatabaseManager.aliceDb.collections.challenge.update(
                { challengeid: this.challengeid }, { $set: { status: "finished" } }
            );


            const notificationChannel: TextChannel = <TextChannel> await this.client.channels.fetch(this.challengeChannelID);

            const challengeEmbedOptions: MessageOptions = await EmbedCreator.createChallengeEmbed(this, this.isWeekly ? "#af46db" : "#e3b32d");

            await notificationChannel.send({
                content: MessageCreator.createAccept(`Successfully started challenge \`${this.challengeid}\`.`),
                ...challengeEmbedOptions
            });

            // Award first place in leaderboard
            const firstPlaceScore: Score | undefined = (await this.getCurrentLeaderboard()).shift();

            if (firstPlaceScore) {
                const winnerBindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUid(firstPlaceScore.uid);

                if (winnerBindInfo) {
                    await DatabaseManager.aliceDb.collections.playerInfo.update(
                        { uid: winnerBindInfo.uid },
                        {
                            $inc: {
                                points: this.isWeekly ? 50 : 25,
                                alicecoins: this.isWeekly ? 100 : 50
                            }
                        }
                    );

                    await DatabaseManager.elainaDb.collections.clan.update(
                        { "member_list.id": winnerBindInfo.discordid },
                        { $inc: { power: this.isWeekly ? 50 : 25 } }
                    );

                    const coinEmoji: GuildEmoji = this.client.emojis.cache.get(Constants.aliceCoinEmote)!;

                    await notificationChannel.send({
                        content: MessageCreator.createAccept(
                            `Congratulations to <@${winnerBindInfo.discordid}> for achieving first place in challenge \`${this.challengeid}\`, earning him/her \`${this.isWeekly ? "50" : "25"}\` points and ${coinEmoji}\`${this.isWeekly ? "100" : "50"}\` Alice coins!`
                        )
                    });
                }
            }

            resolve(this.createOperationResult(true));
        });
    }

    /**
     * Checks whether a score fulfills the challenge requirement.
     * 
     * @param score The score.
     * @returns An object containing information about the operation.
     */
    async checkScoreCompletion(score: Score): Promise<ChallengeOperationResult> {
        if (this.constrain && StringHelper.sortAlphabet(score.mods.map(v => v.acronym).join("")) !== StringHelper.sortAlphabet(this.constrain)) {
            return this.createOperationResult(false, "constrain not fulfilled");
        }

        if (!this.isModFulfills(score.mods)) {
            return this.createOperationResult(false, "usage of EZ, NF, or HT");
        }

        if (!score.replay) {
            await score.downloadReplay();

            if (!score.replay) {
                return this.createOperationResult(false, "replay not found");
            }
        }

        if (score.replay.data?.forcedAR || (score.replay.data?.speedModification ?? 1) !== 1) {
            return this.createOperationResult(false, "custom speed multiplier and/or force AR is used");
        }

        const calcResult: PerformanceCalculationResult = (await BeatmapDifficultyHelper.calculateScorePerformance(score))!;

        const pass: boolean = await this.verifyPassCompletion(
            score,
            calcResult,
            score.replay.calculateHitError()!
        );

        return this.createOperationResult(pass, "pass requirement is not fulfilled");
    }

    /**
     * Checks whether a replay fulfills the challenge requirement.
     * 
     * @param score The data of the replay.
     * @returns An object containing information about the operation.
     */
    async checkReplayCompletion(replay: ReplayAnalyzer): Promise<ChallengeOperationResult> {
        if (!replay.data) {
            await replay.analyze();

            if (!replay.data) {
                return this.createOperationResult(false, "cannot parse replay");
            }
        }

        const data: ReplayData = replay.data;

        if (this.constrain && StringHelper.sortAlphabet(data.convertedMods.map(v => v.acronym).join("")) !== StringHelper.sortAlphabet(this.constrain)) {
            return this.createOperationResult(false, "constrain not fulfilled");
        }

        if (!this.isModFulfills(data.convertedMods)) {
            return this.createOperationResult(false, "usage of EZ, NF, or HT");
        }

        if (data.forcedAR || data.speedModification !== 1) {
            return this.createOperationResult(false, "custom speed multiplier and/or force AR is used");
        }

        const calcResult: PerformanceCalculationResult = (await this.getReplayCalculationResult(data))!;

        if (!this.verifyHitObjectData(calcResult.map.map!, data)) {
            return this.createOperationResult(false, "Replay seem to be edited");
        }

        const pass: boolean = await this.verifyPassCompletion(
            replay,
            calcResult,
            replay.calculateHitError()!
        );

        return this.createOperationResult(pass, "pass requirement is not fulfilled");
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

    async calculateBonusLevel(scoreOrReplay: Score | ReplayAnalyzer): Promise<number> {
        if (scoreOrReplay instanceof ReplayAnalyzer && !scoreOrReplay.data) {
            await scoreOrReplay.analyze();

            if (!scoreOrReplay.data) {
                return 0;
            }
        }

        const calcResult: PerformanceCalculationResult | null = scoreOrReplay instanceof Score ?
            await BeatmapDifficultyHelper.calculateScorePerformance(scoreOrReplay) :
            await this.getReplayCalculationResult(scoreOrReplay.data!)

        if (!calcResult || !calcResult.replay) {
            return 0;
        }

        const scoreV2: number = scoreOrReplay instanceof Score ?
            await this.calculateChallengeScoreV2(scoreOrReplay) :
            await this.calculateChallengeScoreV2(scoreOrReplay.data!);

        const hitErrorInformation: HitErrorInformation = calcResult.replay.calculateHitError()!;

        let level: number = 0;

        for (const bonus of this.bonus.values()) {
            let highestLevel: number = 0;

            for (const tier of bonus.list) {
                let bonusComplete: boolean = false;

                switch (bonus.id) {
                    case "score":
                        const score: number = scoreOrReplay instanceof Score ? scoreOrReplay.score : scoreOrReplay.data!.score;
                        bonusComplete = score >= tier.value;
                        break;
                    case "acc":
                        const accuracy: Accuracy = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy : scoreOrReplay.data!.accuracy;
                        bonusComplete = accuracy.value() * 100 >= tier.value;
                        break;
                    case "miss":
                        const miss: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.nmiss : scoreOrReplay.data!.accuracy.nmiss;
                        bonusComplete = miss < tier.value || !miss;
                        break;
                    case "combo":
                        const combo: number = scoreOrReplay instanceof Score ? scoreOrReplay.combo : scoreOrReplay.data!.maxCombo;
                        bonusComplete = combo >= tier.value;
                        break;
                    case "scorev2":
                        bonusComplete = scoreV2 >= tier.value;
                        break;
                    case "mod":
                        const mods: Mod[] = scoreOrReplay instanceof Score ? scoreOrReplay.mods : scoreOrReplay.data!.convertedMods;
                        bonusComplete = StringHelper.sortAlphabet(mods.map(v => v.acronym).join("")) === StringHelper.sortAlphabet(<string> tier.value);
                        break;
                    case "rank":
                        const rank: string = scoreOrReplay instanceof Score ? scoreOrReplay.rank : scoreOrReplay.data!.rank;
                        bonusComplete = this.getRankTier(rank) >= this.getRankTier(<string> tier.value);
                        break;
                    case "dpp":
                        bonusComplete = calcResult.droid.total >= tier.value;
                        break;
                    case "pp":
                        bonusComplete = calcResult.osu.total >= tier.value;
                        break;
                    case "m300":
                        const n300: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.n300 : scoreOrReplay.data!.accuracy.n300;
                        bonusComplete = n300 >= tier.value;
                        break;
                    case "m100":
                        const n100: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.n100 : scoreOrReplay.data!.accuracy.n100;
                        bonusComplete = n100 <= tier.value;
                        break;
                    case "m50":
                        const n50: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.n50 : scoreOrReplay.data!.accuracy.n50;
                        bonusComplete = n50 <= tier.value;
                        break;
                    case "ur":
                        bonusComplete = hitErrorInformation.unstableRate <= tier.value;
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
        const beatmapInfo: MapInfo = <MapInfo> await BeatmapManager.getBeatmap(this.beatmapid);

        beatmapInfo.hash = this.hash;

        return beatmapInfo.fetchDroidLeaderboard();
    }

    /**
     * Gets the pass requirement information of the challenge.
     */
    getPassInformation(): string {
        return this.getPassOrBonusDescription(this.pass.id, this.pass.value);
    }

    /**
     * Gets the bonus requirement information of the challenge.
     */
    getBonusInformation(): BonusDescription[] {
        return this.bonus.map(v => {
            return {
                id: this.bonusIdToString(v.id),
                description: v.list.map(b => `**Level ${b.level}**: ${this.getPassOrBonusDescription(v.id, b.value)}`).join("\n")
            };
        });
    }

    /**
     * Checks if a sequence of mods fulfills general challenge requirement.
     * 
     * @param mods The mods.
     */
    private isModFulfills(mods: Mod[]): boolean {
        return mods.some(m => m instanceof ModEasy || m instanceof ModNoFail || m instanceof ModHalfTime);
    }

    /**
     * Verifies whether a score passes the challenge.
     * 
     * @param score The score to verify.
     * @param calcResult The calculation result of the score.
     * @param hitErrorInformation The hit error information of the score.
     */
    private async verifyPassCompletion(score: Score, calcResult: PerformanceCalculationResult, hitErrorInformation: HitErrorInformation): Promise<boolean>;

    /**
     * Verifies whether a replay passes the challenge.
     * 
     * @param replay The replay to verify.
     * @param calcResult The calculation result of the replay.
     * @param hitErrorInformation The hit error information of the replay.
     */
    private async verifyPassCompletion(replay: ReplayAnalyzer, calcResult: PerformanceCalculationResult, hitErrorInformation: HitErrorInformation): Promise<boolean>;

    private async verifyPassCompletion(scoreOrReplay: Score | ReplayAnalyzer, calcResult: PerformanceCalculationResult, hitErrorInformation: HitErrorInformation): Promise<boolean> {
        switch (this.pass.id) {
            case "score":
                const score: number = scoreOrReplay instanceof Score ? scoreOrReplay.score : scoreOrReplay.data!.score;
                return score >= this.pass.value;
            case "acc":
                const accuracy: Accuracy = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy : scoreOrReplay.data!.accuracy;
                return accuracy.value() * 100 >= this.pass.value;
            case "miss":
                const miss: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.nmiss : scoreOrReplay.data!.accuracy.nmiss;
                return miss < this.pass.value || !miss;
            case "combo":
                const combo: number = scoreOrReplay instanceof Score ? scoreOrReplay.combo : scoreOrReplay.data!.maxCombo;
                return combo >= this.pass.value;
            case "scorev2":
                const scoreV2: number = scoreOrReplay instanceof Score ?
                    await this.calculateChallengeScoreV2(scoreOrReplay) :
                    await this.calculateChallengeScoreV2(scoreOrReplay.data!);
                return scoreV2 >= this.pass.value;
            case "rank":
                const rank: string = scoreOrReplay instanceof Score ? scoreOrReplay.rank : scoreOrReplay.data!.rank;
                return this.getRankTier(rank) >= this.getRankTier(<string> this.pass.value);
            case "dpp":
                return calcResult.droid.total >= this.pass.value;
            case "pp":
                return calcResult.osu.total >= this.pass.value;
            case "m300":
                const n300: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.n300 : scoreOrReplay.data!.accuracy.n300;
                return n300 >= this.pass.value;
            case "m100":
                const n100: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.n100 : scoreOrReplay.data!.accuracy.n100;
                return n100 <= this.pass.value;
            case "m50":
                const n50: number = scoreOrReplay instanceof Score ? scoreOrReplay.accuracy.n50 : scoreOrReplay.data!.accuracy.n50;
                return n50 <= this.pass.value;
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
    private bonusIdToString(id: BonusID): string {
        switch (id) {
            case "score": 
                return "ScoreV1";
            case "acc": 
                return "Accuracy";
            case "scorev2": 
                return "ScoreV2";
            case "miss": 
                return "Miss Count";
            case "combo": 
                return "Combo";
            case "rank": 
                return "Rank";
            case "mod":
                return "Mods";
            case "dpp": 
                return "Droid PP";
            case "pp": 
                return "PC PP";
            case "m300": 
                return "Minimum 300";
            case "m100":
                return "Maximum 100";
            case "m50":
                return "Maximum 50";
            case "ur":
                return "Maximum Unstable Rate";
        }
    }

    /**
     * Gets the description of a pass or bonus requirement.
     * 
     * @param id The ID of the pass or bonus requirement.
     * @param value The value that must be fulfilled to pass the requirement.
     * @returns The description of the requirement.
     */
    private getPassOrBonusDescription(id: BonusID, value: string | number): string {
        switch (id) {
            case "score":
                return `Score V1 at least **${value.toLocaleString()}**`;
            case "acc": 
                return `Accuracy at least **${value}%**`;
            case "scorev2": 
                return `Score V2 at least **${value.toLocaleString()}**`;
            case "miss": 
                return value === 0 ? "No misses" : `Miss count below **${value}**`;
            case "mod":
                return `Usage of **${(<string> value).toUpperCase()}** mod only`;
            case "combo": 
                return `Combo at least **${value}**`;
            case "rank": 
                return `**${(<string> value).toUpperCase()}** rank or above`;
            case "dpp": 
                return `**${value}** dpp or more`;
            case "pp": 
                return `**${value}** pp or more`;
            case "m300": 
                return `300 hit result at least **${value}**`;
            case "m100":
                return `100 hit result less than or equal to **${value}**`;
            case "m50":
                return `50 hit result less than or equal to **${value}**`;
            case "ur":
                return `UR (unstable rate) below or equal to **${value}**`;
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
            case "D": return 1;
            case "C": return 2;
            case "B": return 3;
            case "A": return 4;
            case "S": return 5;
            case "SH": return 6;
            case "X": return 7;
            case "XH": return 8;
            default: return 0;
        }
    }

    /**
     * Calculates a replay with respect to the challenge.
     * 
     * @param data The data of the replay.
     * @returns The calculation result.
     */
    private async getReplayCalculationResult(data: ReplayData): Promise<PerformanceCalculationResult | null> {
        return BeatmapDifficultyHelper.calculateBeatmapPerformance(
            this.beatmapid,
            new PerformanceCalculationParameters(
                data.convertedMods,
                data.accuracy,
                data.accuracy.value() * 100,
                data.maxCombo,
                1,
                new MapStats({
                    ar: data.forcedAR,
                    isForceAR: !!data.forcedAR,
                    speedMultiplier: data.speedModification,
                    oldStatistics: data.replayVersion <= 3
                })
            )
        );
    }

    /**
     * Verifies whether replay
     */
    private verifyHitObjectData(map: Beatmap, data: ReplayData): boolean {
        if (map.objects.length !== data.hitObjectData.length) {
            return false;
        }

        const modNoSpeedChange: Mod[] = data.convertedMods.filter(m => !ModUtil.speedChangingMods.find(mod => m.acronym === mod.acronym));
        const isPrecise: boolean = data.convertedMods.some(m => m instanceof ModPrecise);
        const od: number = new MapStats({ od: map.od, mods: modNoSpeedChange }).calculate({ mode: modes.droid }).od!;
        const hitWindow: DroidHitWindow = new DroidHitWindow(od);

        const hitWindow300: number = hitWindow.hitWindowFor300(isPrecise);
        const hitWindow100: number = hitWindow.hitWindowFor100(isPrecise);
        const hitWindow50: number = hitWindow.hitWindowFor50(isPrecise);

        for (let i = 0; i < map.objects.length; ++i) {
            const object: HitObject = map.objects[i];
            const hitData: ReplayObjectData = data.hitObjectData[i];

            if (!(object instanceof Circle) || hitData.result === hitResult.RESULT_0) {
                continue;
            }

            const accuracyAbsolute: number = Math.abs(hitData.accuracy);

            let isEdited: boolean = false;

            switch (hitData.result) {
                case hitResult.RESULT_50:
                    isEdited = accuracyAbsolute > hitWindow50;
                    break;
                case hitResult.RESULT_100:
                    isEdited = accuracyAbsolute > hitWindow100;
                    break;
                case hitResult.RESULT_300:
                    isEdited = accuracyAbsolute > hitWindow300;
                    break;
            }

            if (isEdited) {
                return isEdited;
            }
        }

        return false;
    }

    /**
     * Calculates the ScoreV2 of a replay.
     * 
     * @param replay The data of the replay.
     */
    private async calculateChallengeScoreV2(replay: ReplayData): Promise<number>;

    /**
     * Calculates the ScoreV2 of a score.
     * 
     * @param score The score.
     */
    private async calculateChallengeScoreV2(score: Score): Promise<number>;

    private async calculateChallengeScoreV2(scoreOrReplay: Score | ReplayData): Promise<number> {
        const beatmapInfo: MapInfo = (await BeatmapManager.getBeatmap(this.beatmapid))!;

        const maximumScore: number = beatmapInfo.maxScore(
            new MapStats({
                cs: beatmapInfo.cs,
                ar: beatmapInfo.ar,
                od: beatmapInfo.od,
                hp: beatmapInfo.hp,
                mods: ModUtil.pcStringToMods(this.constrain),
                speedMultiplier: scoreOrReplay instanceof Score ? scoreOrReplay.speedMultiplier : scoreOrReplay.speedModification
            })
        );

        const tempScoreV2: number = scoreOrReplay.score / maximumScore * 6e5 + Math.pow(scoreOrReplay.accuracy.value(), 4) * 4e5;

        return tempScoreV2 - (scoreOrReplay.accuracy.nmiss * 0.003 * tempScoreV2);
    }
}