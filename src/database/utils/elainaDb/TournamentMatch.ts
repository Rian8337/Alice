import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { MainBeatmapData } from "@alice-types/tournament/MainBeatmapData";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";
import { Mod, ModDoubleTime, ModHardRock, ModHidden, ModNoFail, ModPrecise, ModUtil, Player, Score } from "osu-droid";
import { TournamentMapLengthInfo } from "../aliceDb/TournamentMapLengthInfo";
import { TournamentMappool } from "./TournamentMappool";

/**
 * Represents a tournament match.
 */
export class TournamentMatch extends Manager implements DatabaseTournamentMatch {
    matchid: string;
    channelId: Snowflake;
    name: string;
    team: [string, number][];
    player: [string, string][];
    status: "scheduled" | "on-going" | "completed";
    result: number[][];
    readonly _id?: ObjectId;

    /**
     * The color code of this match.
     */
    get matchColorCode(): number {
        switch (this.status) {
            case "scheduled":
                return 16776960;
            case "on-going":
                return 65280;
            case "completed":
                return 16711680;
        }
    }

    constructor(data: DatabaseTournamentMatch = DatabaseManager.elainaDb?.collections.tournamentMatch.defaultDocument ?? {}) {
        super();

        this._id = data._id;
        this.matchid = data.matchid;
        this.channelId = data.channelId;
        this.name = data.name;
        this.team = data.team ?? [];
        this.player = data.player ?? [];
        this.status = data.status;
        this.result = data.result ?? [];
    }

    /**
     * Updates the match in match database.
     * 
     * This should only be called after changing everything needed
     * as this will perform a database operation.
     * 
     * @returns An object containing information about the operation.
     */
    updateMatch(): Promise<OperationResult> {
        return DatabaseManager.elainaDb.collections.tournamentMatch.update(
            { matchid: this.matchid },
            {
                $set: {
                    channelId: this.channelId,
                    name: this.name,
                    player: this.player,
                    result: this.result,
                    status: this.status,
                    team: this.team
                }
            }
        );
    }

    /**
     * Gets the last played beatmap from players.
     * 
     * @param poolMainData The tournament mappool of this match.
     * @param poolDurationData The mappool duration data of this match's mappool.
     * @param players The list of players who played in this match.
     * @param pick The beatmap that was picked, if any.
     * @returns The index of the last played beatmap.
     */
    getLastPlayedBeatmap(poolMainData: TournamentMappool, poolDurationData: TournamentMapLengthInfo, players: Player[], pick?: string): number {
        let minTime: number = Number.NEGATIVE_INFINITY;
        let hash: string = "";
        let index: number = -1;

        // TODO: port to here
        if (pick) {
            index = poolDurationData.map.findIndex(v => v[0] === pick);
            if (index !== -1) {
                hash = <string> poolMainData.map[index][3];
            }
        } else {
            for (const player of players) {
                const recentPlay: Score = player.recentPlays[0];
    
                if (minTime >= recentPlay?.date.getTime()) {
                    continue;
                }
    
                hash = recentPlay.hash;
                minTime = recentPlay.date.getTime();
    
                index = poolMainData.map.findIndex(v => v[3] === hash);
            }
        }

        return index;
    }

    /**
     * Verifies whether a score fulfills the criteria of submitting a score.
     * 
     * @param score The score to verify.
     * @param map The beatmap data to verify for.
     * @param forcePR Whether this match enforces the PR mod.
     */
    verifyScore(score: Score, map: MainBeatmapData, forcePR?: boolean): OperationResult {
        if (score.hash !== map[3]) {
            return this.createOperationResult(false, "Score not found");
        }

        let mods: Mod[] = score.mods;

        if (!mods.some(m => m instanceof ModNoFail) || (forcePR && !mods.some(m => m instanceof ModPrecise))) {
            return this.createOperationResult(false, forcePR ? "NFPR is not used" : "NF is not used");
        }

        mods = mods.filter(m => !(m instanceof ModPrecise));

        const speedChangingMods: Mod[] = mods.filter(
            m => ModUtil.speedChangingMods.find(mod => mod.acronym === m.acronym)
        );

        switch (map[0]) {
            case "nm":
                return this.createOperationResult(mods.length === 1, `Other mods except ${forcePR ? "NFPR" : "NF"} was used`);
            case "hd":
                return this.createOperationResult(
                    mods.length === 2 && mods.some(m => m instanceof ModHidden),
                    `Other mods except ${forcePR ? "NFHDPR" : "NFHD"} was used`
                );
            case "hr":
                return this.createOperationResult(
                    mods.length === 2 && mods.some(m => m instanceof ModHardRock),
                    `Other mods except ${forcePR ? "NFHRPR" : "NFHR"} was used`
                );
            case "dt":
                return this.createOperationResult(
                    mods.some(m => m instanceof ModDoubleTime) &&
                    mods.length === (mods.some(m => m instanceof ModHidden) ? 3 : 2),
                    `Other mods except ${forcePR ? "NFDTPR" : "NFDT"} or ${forcePR ? "NFHDDTPR" : "NFHDDT"} was used`
                );
            case "fm":
                return this.createOperationResult(
                    mods.length > 1 && speedChangingMods.length === 0,
                    `${speedChangingMods.map(m => m.acronym).join("")} was used`
                );
            case "tb":
                return this.createOperationResult(
                    mods.length >= 1 && speedChangingMods.length === 0,
                    `${speedChangingMods.map(m => m.acronym).join("")} was used`
                );
        }
    }

    /**
     * Calculates ScoreV2 of a score.
     * 
     * @param score The score achieved.
     * @param accuracy The accuracy achieved.
     * @param misses The amount of misses achieved.
     * @param maxScore The maximum score value to use against the score.
     * @param comboPortion The value of how much combo affects ScoreV2, from 0 to 1.
     * @returns The final ScoreV2.
     */
    calculateScoreV2(score: number, accuracy: number, misses: number, maxScore: number, comboPortion: number): number {
        const tempScoreV2: number = score / maxScore * 1e6 * comboPortion + Math.pow(accuracy, 4) * 1e6 * (1 - comboPortion);

        return Math.max(0, tempScoreV2 - misses * 5e-3 * tempScoreV2);
    }
}