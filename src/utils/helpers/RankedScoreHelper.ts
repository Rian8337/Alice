import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { Collection } from "discord.js";
import { ArrayHelper } from "./ArrayHelper";
import { rankedStatus } from "@rian8337/osu-base";

/**
 * A helper to calculate things related to ranked score.
 */
export abstract class RankedScoreHelper {
    /**
     * Calculates the level of a ranked score.
     *
     * @param rankedScore The ranked score.
     * @returns The level represented by the ranked score.
     */
    static calculateLevel(rankedScore: number): number {
        let level: number = 1;

        while (this.calculateScoreRequirement(level + 1) <= rankedScore) {
            ++level;
        }

        const nextLevelReq: number =
            this.calculateScoreRequirement(level + 1) -
            this.calculateScoreRequirement(level);
        const curLevelReq: number =
            rankedScore - this.calculateScoreRequirement(level);
        level += curLevelReq / nextLevelReq;

        return level;
    }

    /**
     * Calculates the ranked score requirement to reach a level.
     *
     * @param level The level.
     * @returns The ranked score requirement.
     */
    static calculateScoreRequirement(level: number): number {
        return Math.round(
            level <= 100
                ? ((5000 / 3) *
                      (4 * Math.pow(level, 3) -
                          3 * Math.pow(level, 2) -
                          level) +
                      1.25 * Math.pow(1.8, level - 60)) /
                      1.128
                : 23875169174 + 15000000000 * (level - 100)
        );
    }

    /**
     * Determines whether a score in a beatmap can be submitted into the ranked score system.
     *
     * @param rankedStatus The ranking status of the beatmap.
     * @returns Whether a score in the beatmap can be submitted.
     */
    static isBeatmapEligible(rankedStatus: rankedStatus): boolean {
        return !WhitelistManager.beatmapNeedsWhitelisting(rankedStatus);
    }

    /**
     * Converts a score list back into its array form.
     *
     * @param scoreList The list.
     */
    static toArray(scoreList: Collection<string, number>): [number, string][] {
        return ArrayHelper.collectionToArray(scoreList).map((v) => [
            v.value,
            v.key,
        ]);
    }
}
