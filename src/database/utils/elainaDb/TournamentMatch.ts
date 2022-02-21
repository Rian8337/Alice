import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { MainBeatmapData } from "@alice-types/tournament/MainBeatmapData";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";
import {
    Mod,
    ModDoubleTime,
    ModEasy,
    ModHardRock,
    ModHidden,
    ModNoFail,
    ModPrecise,
    ModUtil,
} from "@rian8337/osu-base";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { TournamentMapLengthInfo } from "../aliceDb/TournamentMapLengthInfo";
import { TournamentMappool } from "./TournamentMappool";
import { Language } from "@alice-localization/base/Language";
import { TournamentMatchLocalization } from "@alice-localization/database/utils/elainaDb/TournamentMatchLocalization";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

/**
 * Represents a tournament match.
 */
export class TournamentMatch
    extends Manager
    implements DatabaseTournamentMatch
{
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

    constructor(
        data: DatabaseTournamentMatch = DatabaseManager.elainaDb?.collections
            .tournamentMatch.defaultDocument ?? {}
    ) {
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
                    team: this.team,
                },
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
    getLastPlayedBeatmap(
        poolMainData: TournamentMappool,
        poolDurationData: TournamentMapLengthInfo,
        players: Player[],
        pick?: string
    ): number {
        let minTime: number = Number.NEGATIVE_INFINITY;
        let hash: string = "";
        let index: number = -1;

        if (pick) {
            index = poolDurationData.map.findIndex((v) => v[0] === pick);
            if (index !== -1) {
                hash = <string>poolMainData.map[index][3];
            }
        } else {
            for (const player of players) {
                const recentPlay: Score = player.recentPlays[0];

                if (minTime >= recentPlay?.date.getTime()) {
                    continue;
                }

                hash = recentPlay.hash;
                minTime = recentPlay.date.getTime();

                index = poolMainData.map.findIndex((v) => v[3] === hash);
            }
        }

        return index;
    }

    /**
     * Verifies whether a team's scores fulfill the criteria of team-wide criteria.
     *
     * @param scores The scores to verify.
     * @param map The beatmap data to verify for.
     * @param language The locale of the user who attempted to verify a team's score. Defaults to English.
     */
    verifyTeamScore(
        scores: Score[],
        map: MainBeatmapData,
        language: Language = "en"
    ): OperationResult {
        if (map[0] !== "fm") {
            return this.createOperationResult(true);
        }

        return this.createOperationResult(
            scores.some((score) =>
                score.mods.some(
                    (m) =>
                        m instanceof ModEasy ||
                        m instanceof ModHidden ||
                        m instanceof ModHardRock
                )
            ),
            this.getLocalization(language).getTranslation(
                "teamMembersIncorrectFMmod"
            )
        );
    }

    /**
     * Verifies whether a score fulfills the criteria of submitting a score.
     *
     * @param score The score to verify.
     * @param map The beatmap data to verify for.
     * @param teamScoreStatus Whether the team fulfills the criteria of submitting a score.
     * @param forcePR Whether this match enforces the PR mod.
     * @param language The locale of the user who attempted to verify the score. Defaults to English.
     */
    async verifyScore(
        score: Score,
        map: MainBeatmapData,
        teamScoreStatus: boolean,
        forcePR?: boolean,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: TournamentMatchLocalization =
            this.getLocalization(language);

        if (score.hash !== map[3]) {
            return this.createOperationResult(
                false,
                localization.getTranslation("scoreNotFound")
            );
        }

        let mods: Mod[] = score.mods;

        if (
            !mods.some((m) => m instanceof ModNoFail) ||
            (forcePR && !mods.some((m) => m instanceof ModPrecise))
        ) {
            return this.createOperationResult(
                false,
                StringHelper.formatString(
                    localization.getTranslation("modsIsNotUsed"),
                    forcePR ? "NFPR" : "NF"
                )
            );
        }

        await score.downloadReplay();

        if (!score.replay || !score.replay.data) {
            return this.createOperationResult(
                false,
                localization.getTranslation("replayNotFound")
            );
        }

        if (score.replay.data.replayVersion > 4) {
            return this.createOperationResult(
                false,
                localization.getTranslation("unsupportedGameVersion")
            );
        }

        mods = mods.filter((m) => !(m instanceof ModPrecise));

        const speedChangingMods: Mod[] = mods.filter((m) =>
            ModUtil.speedChangingMods.find((mod) => mod.acronym === m.acronym)
        );

        switch (map[0]) {
            case "nm":
                return this.createOperationResult(
                    mods.length === 1,
                    StringHelper.formatString(
                        localization.getTranslation("modsExceptNotUsed"),
                        forcePR ? "NFPR" : "NF"
                    )
                );
            case "hd":
                return this.createOperationResult(
                    mods.length === 2 &&
                        mods.some((m) => m instanceof ModHidden),
                    StringHelper.formatString(
                        localization.getTranslation("modsExceptNotUsed"),
                        forcePR ? "NFHDHR" : "NFHD"
                    )
                );
            case "hr":
                return this.createOperationResult(
                    mods.length === 2 &&
                        mods.some((m) => m instanceof ModHardRock),
                    StringHelper.formatString(
                        localization.getTranslation("modsExceptNotUsed"),
                        forcePR ? "NFHRPR" : "NFHR"
                    )
                );
            case "dt":
                return this.createOperationResult(
                    mods.some((m) => m instanceof ModDoubleTime) &&
                        mods.length ===
                            (mods.some((m) => m instanceof ModHidden) ? 3 : 2),
                    StringHelper.formatString(
                        localization.getTranslation("modsExceptNotUsed"),
                        forcePR ? "NF(HD)DTPR" : "NF(HD)DT"
                    )
                );
            case "fm":
                return this.createOperationResult(
                    (mods.length > 1 || teamScoreStatus) &&
                        speedChangingMods.length === 0,
                    StringHelper.formatString(
                        localization.getTranslation("modsWasUsed"),
                        speedChangingMods.map((m) => m.acronym).join("")
                    )
                );
            case "tb":
                return this.createOperationResult(
                    mods.length >= 1 && speedChangingMods.length === 0,
                    StringHelper.formatString(
                        localization.getTranslation("modsWasUsed"),
                        speedChangingMods.map((m) => m.acronym).join("")
                    )
                );
        }
    }

    /**
     * Calculates ScoreV2 of a score.
     *
     * @param score The score achieved.
     * @param accuracy The accuracy achieved, from 0 to 1.
     * @param misses The amount of misses achieved.
     * @param maxScore The maximum score value to use against the score.
     * @param comboPortion The value of how much combo affects ScoreV2, from 0 to 1.
     * @returns The final ScoreV2.
     */
    calculateScoreV2(
        score: number,
        accuracy: number,
        misses: number,
        maxScore: number,
        comboPortion: number
    ): number {
        const tempScoreV2: number =
            Math.sqrt(score / maxScore) * 1e6 * comboPortion +
            Math.pow(accuracy, 2) * 1e6 * (1 - comboPortion);

        return Math.max(0, tempScoreV2 - misses * 5e-3 * tempScoreV2);
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): TournamentMatchLocalization {
        return new TournamentMatchLocalization(language);
    }
}
