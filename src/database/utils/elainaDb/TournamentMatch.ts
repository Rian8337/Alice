import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
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
     * @param pool The tournament mappool of this match.
     * @param players The list of players who played in this match.
     * @param pick The beatmap that was picked, if any.
     * @returns The index of the last played beatmap.
     */
    getLastPlayedBeatmap(
        pool: TournamentMappool,
        players: Player[],
        pick?: string
    ): TournamentBeatmap | null {
        let map: TournamentBeatmap | null = null;

        if (pick) {
            map = pool.getBeatmapFromPick(pick);
        } else {
            let minTime: number = Number.NEGATIVE_INFINITY;
            let hash: string = "";

            for (const player of players) {
                const recentPlay: Score = player.recentPlays[0];

                if (minTime >= recentPlay?.date.getTime()) {
                    continue;
                }

                hash = recentPlay.hash;
                minTime = recentPlay.date.getTime();

                map = pool.getBeatmapFromHash(hash);
            }
        }

        return map;
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
        map: TournamentBeatmap,
        language: Language = "en"
    ): OperationResult {
        if (map.mode !== "fm") {
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
        map: TournamentBeatmap,
        teamScoreStatus: boolean,
        forcePR?: boolean,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: TournamentMatchLocalization =
            this.getLocalization(language);

        if (score.hash !== map.hash) {
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

        switch (map.mode) {
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
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): TournamentMatchLocalization {
        return new TournamentMatchLocalization(language);
    }
}
