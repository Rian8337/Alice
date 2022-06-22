import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { Symbols } from "@alice-enums/utils/Symbols";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { MapInfo, rankedStatus } from "@rian8337/osu-base";
import { DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import {
    BaseCommandInteraction,
    Collection,
    MessageEmbed,
    Snowflake,
} from "discord.js";
import { CommandHelper } from "./CommandHelper";

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
     * Displays a DPP list as a response to an interaction.
     *
     * @param interaction The interaction to respond to.
     * @param bindInfo The bind information of the user.
     * @param page The initial page to display.
     */
    static async displayDPPList(
        interaction: BaseCommandInteraction,
        bindInfo: UserBind,
        page: number
    ): Promise<void> {
        const ppRank: number =
            await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(
                bindInfo.pptotal
            );

        const embed: MessageEmbed = await EmbedCreator.createDPPListEmbed(
            interaction,
            bindInfo,
            ppRank,
            await CommandHelper.getLocale(interaction)
        );

        const list: PPEntry[] = [...bindInfo.pp.values()];

        const onPageChange: OnButtonPageChange = async (_, page) => {
            for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
                const pp: PPEntry | undefined = list[i];

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

                    embed.addField(
                        `${i + 1}. ${pp.title} ${modstring}`,
                        `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${
                            pp.miss
                        } ${Symbols.missIcon} | __${pp.pp} pp__ (Net pp: ${(
                            pp.pp * Math.pow(0.95, i)
                        ).toFixed(2)} pp)`
                    );
                } else {
                    embed.addField(`${i + 1}. -`, "-");
                }
            }
        };

        MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [embed] },
            [interaction.user.id],
            Math.max(page, 1),
            Math.ceil(bindInfo.pp.size / 5),
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
    static insertScore(
        dppList: Collection<string, PPEntry>,
        entries: PPEntry[]
    ): void {
        let needsSorting: boolean = false;

        for (const entry of entries) {
            if (isNaN(entry.pp)) {
                continue;
            }

            if (
                (dppList.get(entry.hash)?.pp ?? 0) >= entry.pp ||
                (dppList.size === 75 && dppList.at(-1)!.pp >= entry.pp)
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
     * Converts a score to PP entry.
     *
     * @param score The score to convert.
     * @param calculationResult The dpp calculation result of the score.
     * @returns A PP entry from the score and calculation result.
     */
    static scoreToPPEntry(
        score: Score,
        calculationResult: PerformanceCalculationResult<DroidPerformanceCalculator>
    ): PPEntry {
        return {
            hash: calculationResult.map.hash,
            title: calculationResult.map.fullTitle,
            pp: parseFloat(calculationResult.result.total.toFixed(2)),
            mods: score.mods.reduce((a, v) => a + v.acronym, ""),
            accuracy: parseFloat((score.accuracy.value() * 100).toFixed(2)),
            combo: score.combo,
            miss: score.accuracy.nmiss,
            scoreID: score.scoreID,
        };
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
    }
}
