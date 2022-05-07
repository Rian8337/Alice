import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { MapInfo, rankedStatus } from "@rian8337/osu-base";
import { DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { Collection, Snowflake } from "discord.js";

/**
 * A helper for droid performance points submission.
 */
export abstract class DPPHelper {
    /**
     * The ID of the role that permits pp-related moderation actions.
     */
    static readonly ppModeratorRole: Snowflake = "551662194270404644";

    /**
     * Checks a beatmap's submission validity.
     *
     * @param beatmap The beatmap.
     * @returns The validity of the beatmap.
     */
    static async checkSubmissionValidity(
        beatmap: MapInfo
    ): Promise<DPPSubmissionValidity>;

    /**
     * Checks a score's submission validity.
     *
     * @param score The score.
     * @returns The validity of the score.
     */
    static async checkSubmissionValidity(
        score: Score
    ): Promise<DPPSubmissionValidity>;

    static async checkSubmissionValidity(
        beatmapOrScore: Score | MapInfo
    ): Promise<DPPSubmissionValidity> {
        const beatmapInfo: MapInfo | null =
            beatmapOrScore instanceof MapInfo
                ? beatmapOrScore
                : await BeatmapManager.getBeatmap(beatmapOrScore.hash, false);

        if (!beatmapInfo) {
            return DPPSubmissionValidity.BEATMAP_NOT_FOUND;
        }

        switch (true) {
            case beatmapOrScore instanceof Score &&
                beatmapOrScore.forcedAR !== undefined:
                return DPPSubmissionValidity.SCORE_USES_FORCE_AR;
            case beatmapOrScore instanceof Score &&
                beatmapOrScore.speedMultiplier !== 1:
                return DPPSubmissionValidity.SCORE_USES_CUSTOM_SPEED;
            case beatmapInfo.approved === rankedStatus.LOVED &&
                (beatmapInfo.hitLength < 30 ||
                    beatmapInfo.hitLength / beatmapInfo.totalLength < 0.6):
                return DPPSubmissionValidity.BEATMAP_TOO_SHORT;
            case await WhitelistManager.isBlacklisted(beatmapInfo.beatmapID):
                return DPPSubmissionValidity.BEATMAP_IS_BLACKLISTED;
            case WhitelistManager.beatmapNeedsWhitelisting(
                beatmapInfo.approved
            ) &&
                (await WhitelistManager.getBeatmapWhitelistStatus(
                    beatmapInfo.hash
                )) !== "updated":
                return DPPSubmissionValidity.BEATMAP_NOT_WHITELISTED;
            default:
                return DPPSubmissionValidity.VALID;
        }
    }

    /**
     * Inserts a score into a list of dpp plays.
     *
     * @param dppList The list of dpp plays, mapped by hash.
     * @param score The score.
     * @param calculationResult The calculation result of the score.
     */
    static insertScore(
        dppList: Collection<string, PPEntry>,
        score: Score,
        calculationResult: PerformanceCalculationResult<DroidPerformanceCalculator>
    ): void {
        if (isNaN(calculationResult.result.total)) {
            return;
        }

        const ppEntry: PPEntry = {
            hash: calculationResult.map.hash,
            title: calculationResult.map.fullTitle,
            pp: parseFloat(calculationResult.result.total.toFixed(2)),
            mods: score.mods.map((v) => v.acronym).join(""),
            accuracy: parseFloat((score.accuracy.value() * 100).toFixed(2)),
            combo: score.combo,
            miss: score.accuracy.nmiss,
            scoreID: score.scoreID,
        };

        if (
            (dppList.get(calculationResult.map.hash)?.pp ?? 0) >= ppEntry.pp ||
            (dppList.size === 75 && dppList.at(-1)!.pp >= ppEntry.pp)
        ) {
            return;
        }

        dppList.set(calculationResult.map.hash, ppEntry);

        dppList.sort((a, b) => {
            return b.pp - a.pp;
        });

        while (dppList.size > 75) {
            dppList.delete(dppList.lastKey()!);
        }
    }

    /**
     * Calculates the final performance points from a list of pp entries.
     *
     * @param list The list.
     * @returns The final performance points.
     */
    static calculateFinalPerformancePoints(
        list: Collection<string, PPEntry>
    ): number {
        list.sort((a, b) => {
            return b.pp - a.pp;
        });

        return [...list.values()].reduce(
            (a, v, i) => a + v.pp * Math.pow(0.95, i),
            0
        );
    }

    /**
     * Deletes a beatmap with specific hash from all players.
     *
     * @param hash The beatmap's hash.
     */
    static async deletePlays(hash: string): Promise<void> {
        const toUpdateList: Collection<string, UserBind> =
            await DatabaseManager.elainaDb.collections.userBind.get(
                "discordid",
                { "pp.hash": hash },
                { projection: { _id: 0, discordid: 1, pp: 1, playc: 1 } }
            );

        for (const toUpdate of toUpdateList.values()) {
            toUpdate.pp.delete(hash);

            await DatabaseManager.elainaDb.collections.userBind.update(
                { discordid: toUpdate.discordid },
                {
                    $set: {
                        pp: [...toUpdate.pp.values()],
                        pptotal: this.calculateFinalPerformancePoints(
                            toUpdate.pp
                        ),
                        playc: Math.max(0, toUpdate.playc - 1),
                    },
                }
            );
        }
    }
}
