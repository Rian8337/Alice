import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { PerformanceCalculationResult } from "@alice-interfaces/utils/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { Collection, CommandInteraction, MessageEmbed } from "discord.js";
import { MapInfo, Score } from "osu-droid";

/**
 * A helper for droid performance points submission.
 */
export abstract class DPPHelper {
    /**
     * Checks a score's submission validity.
     * 
     * @param score The score.
     * @returns The validity of the score.
     */
    static async checkSubmissionValidity(score: Score): Promise<DPPSubmissionValidity> {
        const calculationResult: MapInfo | null = await BeatmapManager.getBeatmap(score.hash);

        if (!calculationResult) {
            return DPPSubmissionValidity.BEATMAP_NOT_FOUND;
        }

        switch (true) {
            case await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(score.uid):
                return DPPSubmissionValidity.UID_IS_BANNED;
            case score.forcedAR !== undefined:
                return DPPSubmissionValidity.SCORE_USES_FORCE_AR;
            case score.speedMultiplier !== 1:
                return DPPSubmissionValidity.SCORE_USES_CUSTOM_SPEED;
            case await WhitelistManager.isBlacklisted(calculationResult.beatmapID):
                return DPPSubmissionValidity.BEATMAP_IS_BLACKLISTED;
            case WhitelistManager.beatmapNeedsWhitelisting(calculationResult.approved) &&
                await WhitelistManager.getBeatmapWhitelistStatus(calculationResult.hash) !== "updated":
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
     * @param calculationResult The calculation result of the score. If omitted, the score will be calculated on fly.
     */
    static insertScore(dppList: Collection<string, PPEntry>, score: Score, calculationResult: PerformanceCalculationResult): void {
        const ppEntry: PPEntry = {
            hash: calculationResult.map.hash,
            title: calculationResult.map.fullTitle,
            pp: parseFloat(calculationResult.droid.total.toFixed(2)),
            mods: score.mods.map(v => v.acronym).join(""),
            accuracy: parseFloat((score.accuracy.value() * 100).toFixed(2)),
            combo: score.combo,
            miss: score.accuracy.nmiss,
            scoreID: score.scoreID
        };

        dppList.set(calculationResult.map.hash, ppEntry)
            .sort((a, b) => {
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
    static calculateFinalPerformancePoints(list: Collection<string, PPEntry>): number {
        list.sort((a, b) => {
            return b.pp - a.pp;
        });

        return [...list.values()].reduce((a, v, i) => a + v.pp * Math.pow(0.95, i), 0);
    }

    /**
     * Deletes a beatmap with specific hash from all players.
     * 
     * @param hash The beatmap's hash.
     */
    static async deletePlays(hash: string): Promise<void> {
        const toUpdateList: Collection<string, UserBind> = await DatabaseManager.elainaDb.collections.userBind.get(
            "discordid",
            { "pp.hash": hash },
            { projection: { _id: 0, discordid: 1, pp: 1, playc: 1 } }
        );

        for await (const toUpdate of toUpdateList.values()) {
            toUpdate.pp.delete(hash);

            await DatabaseManager.elainaDb.collections.userBind.update(
                { discordid: toUpdate.discordid },
                {
                    $set: {
                        pp: [...toUpdate.pp.values()],
                        pptotal: this.calculateFinalPerformancePoints(toUpdate.pp),
                        playc: Math.max(0, toUpdate.playc - 1)
                    }
                }
            );
        }
    }
}