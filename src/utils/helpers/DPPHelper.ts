import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OldPPProfile } from "@alice-database/utils/aliceDb/OldPPProfile";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { Symbols } from "@alice-enums/utils/Symbols";
import { RepliableInteraction } from "@alice-structures/core/RepliableInteraction";
import { OldPPEntry } from "@alice-structures/dpp/OldPPEntry";
import { PPEntry } from "@alice-structures/dpp/PPEntry";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { OldPerformanceCalculationResult } from "@alice-utils/dpp/OldPerformanceCalculationResult";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { MapInfo, rankedStatus } from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { Collection, EmbedBuilder, Snowflake } from "discord.js";
import { CommandHelper } from "./CommandHelper";
import { NumberHelper } from "./NumberHelper";

/**
 * A helper for droid performance points related things.
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
                : await BeatmapManager.getBeatmap(beatmapOrScore.hash, {
                      checkFile: false,
                  });

        if (!beatmapInfo) {
            return DPPSubmissionValidity.beatmapNotFound;
        }

        switch (true) {
            case beatmapOrScore instanceof Score &&
                beatmapOrScore.forcedAR !== undefined:
                return DPPSubmissionValidity.scoreUsesForceAR;
            case beatmapOrScore instanceof Score &&
                beatmapOrScore.speedMultiplier !== 1:
                return DPPSubmissionValidity.scoreUsesCustomSpeed;
            case beatmapInfo.approved === rankedStatus.LOVED &&
                (beatmapInfo.hitLength < 30 ||
                    beatmapInfo.hitLength / beatmapInfo.totalLength < 0.6):
                return DPPSubmissionValidity.beatmapTooShort;
            case await WhitelistManager.isBlacklisted(beatmapInfo.beatmapID):
                return DPPSubmissionValidity.beatmapIsBlacklisted;
            case WhitelistManager.beatmapNeedsWhitelisting(
                beatmapInfo.approved
            ) &&
                (await WhitelistManager.getBeatmapWhitelistStatus(
                    beatmapInfo.hash
                )) !== "updated":
                return DPPSubmissionValidity.beatmapNotWhitelisted;
            default:
                return DPPSubmissionValidity.valid;
        }
    }

    /**
     * Displays a DPP list as a response to an interaction.
     *
     * @param interaction The interaction to respond to.
     * @param playerInfo The player's information.
     * @param page The initial page to display.
     */
    static async displayDPPList(
        interaction: RepliableInteraction,
        playerInfo: UserBind | OldPPProfile,
        page: number
    ): Promise<void> {
        const ppRank: number = await (playerInfo instanceof OldPPProfile
            ? DatabaseManager.aliceDb.collections.playerOldPPProfile
            : DatabaseManager.elainaDb.collections.userBind
        ).getUserDPPRank(playerInfo.pptotal);

        const embed: EmbedBuilder = await EmbedCreator.createDPPListEmbed(
            interaction,
            playerInfo,
            ppRank,
            await CommandHelper.getLocale(interaction)
        );

        const list: OldPPEntry[] = [...playerInfo.pp.values()];

        const onPageChange: OnButtonPageChange = async (_, page) => {
            for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
                const pp: OldPPEntry | undefined = list[i];

                if (pp) {
                    let modstring = pp.mods ? `+${pp.mods}` : "";
                    if (
                        pp.forcedAR ||
                        (pp.speedMultiplier && pp.speedMultiplier !== 1)
                    ) {
                        if (pp.mods) {
                            modstring += " ";
                        }

                        modstring += "(";

                        if (pp.forcedAR) {
                            modstring += `AR${pp.forcedAR}`;
                        }

                        if (pp.speedMultiplier && pp.speedMultiplier !== 1) {
                            if (pp.forcedAR) {
                                modstring += ", ";
                            }

                            modstring += `${pp.speedMultiplier}x`;
                        }

                        modstring += ")";
                    }

                    embed.addFields({
                        name: `${i + 1}. ${pp.title} ${modstring}`,
                        value: `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${
                            pp.miss
                        } ${Symbols.missIcon} | __${pp.pp} pp__ (Net pp: ${(
                            pp.pp * Math.pow(0.95, i)
                        ).toFixed(2)} pp)`,
                    });
                } else {
                    embed.addFields({ name: `${i + 1}. -`, value: "-" });
                }
            }
        };

        MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [embed] },
            [interaction.user.id],
            Math.max(page, 1),
            Math.ceil(playerInfo.pp.size / 5),
            120,
            onPageChange
        );
    }

    /**
     * Inserts a score into a list of dpp plays.
     *
     * @param dppList The list of dpp plays, mapped by hash.
     * @param entries The plays to add.
     */
    static insertScore<T extends OldPPEntry>(
        dppList: Collection<string, T>,
        entries: T[]
    ): void {
        let needsSorting: boolean = false;

        for (const entry of entries) {
            if (isNaN(entry.pp)) {
                continue;
            }

            if (
                (dppList.get(entry.hash)?.pp ?? 0) >= entry.pp ||
                (dppList.size === 75 && dppList.last()!.pp >= entry.pp)
            ) {
                continue;
            }

            needsSorting = true;

            dppList.set(entry.hash, entry);
        }

        if (needsSorting) {
            dppList.sort((a, b) => {
                return b.pp - a.pp;
            });
        }

        while (dppList.size > 75) {
            dppList.delete(dppList.lastKey()!);
        }
    }

    /**
     * Checks whether a PP entry will be kept once it's entered to the list.
     *
     * @param dppList The list of dpp plays.
     * @param entry The entry to check.
     * @returns Whether the PP entry will be kept.
     */
    static checkScoreInsertion<T extends OldPPEntry>(
        dppList: Collection<string, T>,
        entry: T
    ): boolean {
        if (dppList.size < 75) {
            return true;
        }

        if (
            dppList.has(entry.hash) &&
            dppList.get(entry.hash)!.pp >= entry.pp
        ) {
            return false;
        }

        return (dppList.last()?.pp ?? 0) < entry.pp;
    }

    /**
     * Converts a score to PP entry.
     *
     * @param score The score to convert.
     * @param calculationResult The dpp calculation result of the score.
     * @returns A PP entry from the score and calculation result.
     */
    static scoreToPPEntry(
        score: Score,
        calculationResult: PerformanceCalculationResult<
            DroidDifficultyCalculator,
            DroidPerformanceCalculator
        >
    ): PPEntry {
        return {
            hash: calculationResult.map.hash,
            title: calculationResult.map.fullTitle,
            pp: NumberHelper.round(calculationResult.result.total, 2),
            mods: score.mods.reduce((a, v) => a + v.acronym, ""),
            accuracy: NumberHelper.round(score.accuracy.value() * 100, 2),
            combo: score.combo,
            miss: score.accuracy.nmiss,
            scoreID: score.scoreID,
        };
    }

    /**
     * Converts a score to an old PP entry.
     *
     * @param score The score to convert.
     * @param calculationResult The dpp calculation result of the score.
     * @returns An old PP entry from the score and calculation result.
     */
    static scoreToOldPPEntry(
        score: Score,
        calculationResult: OldPerformanceCalculationResult
    ): OldPPEntry {
        return {
            hash: calculationResult.map.hash,
            title: calculationResult.map.fullTitle,
            pp: parseFloat(calculationResult.result.total.toFixed(2)),
            mods: score.mods.reduce((a, v) => a + v.acronym, ""),
            accuracy: parseFloat((score.accuracy.value() * 100).toFixed(2)),
            combo: score.combo,
            miss: score.accuracy.nmiss,
        };
    }

    /**
     * Calculates the weighted accuracy of a dpp list.
     *
     * @param dppList The list.
     * @returns The weighted accuracy of the list.
     */
    static calculateWeightedAccuracy<T extends OldPPEntry>(
        dppList: Collection<string, T>
    ): number {
        if (dppList.size === 0) {
            return 0;
        }

        let accSum: number = 0;
        let weight: number = 0;
        let i: number = 0;

        for (const pp of dppList.values()) {
            accSum += pp.accuracy * Math.pow(0.95, i);
            weight += Math.pow(0.95, i);
            ++i;
        }

        return accSum / weight;
    }

    /**
     * Calculates the final performance points from a list of pp entries.
     *
     * @param list The list.
     * @returns The final performance points.
     */
    static calculateFinalPerformancePoints<T extends OldPPEntry>(
        list: Collection<string, T>
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

        const oldPPToUpdateList: Collection<string, OldPPProfile> =
            await DatabaseManager.aliceDb.collections.playerOldPPProfile.get(
                "discordId",
                { "pp.hash": hash },
                { projection: { _id: 0, discordId: 1, pp: 1, playc: 1 } }
            );

        for (const toUpdate of toUpdateList.values()) {
            toUpdate.pp.delete(hash);

            await DatabaseManager.elainaDb.collections.userBind.updateOne(
                { discordid: toUpdate.discordid },
                {
                    $set: {
                        pptotal: this.calculateFinalPerformancePoints(
                            toUpdate.pp
                        ),
                        playc: Math.max(0, toUpdate.playc - 1),
                    },
                    $pull: {
                        "pp.hash": hash,
                    },
                }
            );
        }

        for (const toUpdate of oldPPToUpdateList.values()) {
            toUpdate.pp.delete(hash);

            await DatabaseManager.aliceDb.collections.playerOldPPProfile.updateOne(
                { discordId: toUpdate.discordId },
                {
                    $set: {
                        pptotal: this.calculateFinalPerformancePoints(
                            toUpdate.pp
                        ),
                        playc: Math.max(0, toUpdate.playc - 1),
                    },
                    $pull: {
                        "pp.hash": hash,
                    },
                }
            );
        }
    }
}
