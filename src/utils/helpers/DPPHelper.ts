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
    static async checkSubmissionValidity(score: Score): Promise<DPPSubmissionValidity> {
        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(score.hash);

        if (!beatmapInfo) {
            return DPPSubmissionValidity.BEATMAP_NOT_FOUND;
        }

        switch (true) {
            case await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(score.uid):
                return DPPSubmissionValidity.UID_IS_BANNED;
            case score.forcedAR !== undefined:
                return DPPSubmissionValidity.SCORE_USES_FORCE_AR;
            case score.speedMultiplier !== 1:
                return DPPSubmissionValidity.SCORE_USES_CUSTOM_SPEED;
            case await WhitelistManager.isBlacklisted(beatmapInfo.beatmapID):
                return DPPSubmissionValidity.BEATMAP_IS_BLACKLISTED;
            case WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved) &&
                await WhitelistManager.getBeatmapWhitelistStatus(beatmapInfo.hash) !== "updated":
                return DPPSubmissionValidity.BEATMAP_NOT_WHITELISTED;
            default:
                return DPPSubmissionValidity.VALID;
        }
    }

    /**
     * Inserts a score into a list of dpp plays.
     * 
     * @param dppList The list of dpp plays, mapped by hash.
     * @param beatmapInfo Information about the beatmap of the score.
     * @param score The score.
     * @param calculationResult The calculation result of the score. If omitted, the score will be calculated on fly.
     */
    static insertScore(dppList: Collection<string, PPEntry>, beatmapInfo: MapInfo, score: Score, calculationResult: PerformanceCalculationResult): void {
        const ppEntry: PPEntry = {
            hash: beatmapInfo.hash,
            title: beatmapInfo.fullTitle,
            pp: parseFloat(calculationResult.droid.total.toFixed(2)),
            mods: score.mods.map(v => v.acronym).join(""),
            accuracy: parseFloat((score.accuracy.value() * 100).toFixed(2)),
            combo: score.combo,
            miss: score.accuracy.nmiss,
            scoreID: score.scoreID
        };

        dppList.set(beatmapInfo.hash, ppEntry)
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
     * Views the DPP list of a player.
     * 
     * @param interaction The interaction that triggered this function.
     * @param bindInfo The bind information of the player.
     * @param page The page to view. Defaults to 1.
     */
    static async viewDPPList(interaction: CommandInteraction, bindInfo: UserBind, page: number = 1): Promise<void> {
        const ppRank: number = await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(bindInfo.pptotal);

        const embed: MessageEmbed = await EmbedCreator.createDPPListEmbed(interaction, bindInfo, ppRank);

        const onPageChange: OnButtonPageChange = async (options, page, contents: PPEntry[]) => {
            const embed: MessageEmbed = <MessageEmbed> options.embeds![0];

            for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
                const pp: PPEntry = contents[i];
                if (pp) {
                    let modstring = pp.mods ? `+${pp.mods}` : "";
                    if (pp.forcedAR || (pp.speedMultiplier && pp.speedMultiplier !== 1)) {
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

                    embed.addField(`${i+1}. ${pp.title} ${modstring}`, `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${pp.miss} ❌ | __${pp.pp} pp__ (Net pp: ${(pp.pp * Math.pow(0.95, i)).toFixed(2)} pp)`);
                } else {
                    embed.addField(`${i+1}. -`, "-");
                }
            }

            options.embeds![0] = embed;
        };

        MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [ embed ] },
            [interaction.user.id],
            [...bindInfo.pp.values()],
            5,
            page,
            120,
            onPageChange
        );
    }
}