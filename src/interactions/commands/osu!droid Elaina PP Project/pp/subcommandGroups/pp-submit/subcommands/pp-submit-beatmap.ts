import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Constants } from "@alice-core/Constants";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { Collection, EmbedBuilder, GuildMember } from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { Symbols } from "@alice-enums/utils/Symbols";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { OldPerformanceCalculationResult } from "@alice-utils/dpp/OldPerformanceCalculationResult";
import { BeatmapOldDifficultyHelper } from "@alice-utils/helpers/BeatmapOldDifficultyHelper";
import { OldPPProfile } from "@alice-database/utils/aliceDb/OldPPProfile";
import { OldPPProfileCollectionManager } from "@alice-database/managers/aliceDb/OldPPProfileCollectionManager";
import { OldPPEntry } from "@alice-structures/dpp/OldPPEntry";
import { PPEntry } from "@alice-structures/dpp/PPEntry";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: PPLocalization = new PPLocalization(
        await CommandHelper.getLocale(interaction)
    );

    await InteractionHelper.deferReply(interaction);

    const bindDbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;
    const oldPPDbManager: OldPPProfileCollectionManager =
        DatabaseManager.aliceDb.collections.playerOldPPProfile;

    const bindInfo: UserBind | null = await bindDbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                uid: 1,
                username: 1,
                pp: 1,
                pptotal: 1,
            },
        }
    );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    const oldPPInfo: OldPPProfile | null = await oldPPDbManager.getFromUser(
        interaction.user
    );

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapID) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapID,
        { checkFile: false }
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const score: Score | null = await Score.getFromHash(
        bindInfo.uid,
        beatmapInfo.hash
    );

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noScoreSubmitted")
            ),
        });
    }

    if (
        await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
            score.uid
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidIsBanned")
            ),
        });
    }

    const submissionValidity: DPPSubmissionValidity =
        await DPPHelper.checkSubmissionValidity(score);

    switch (submissionValidity) {
        case DPPSubmissionValidity.beatmapIsBlacklisted:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapIsBlacklisted")
                ),
            });
        case DPPSubmissionValidity.beatmapNotWhitelisted:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapNotWhitelisted")
                ),
            });
        case DPPSubmissionValidity.beatmapTooShort:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("beatmapTooShort")
                ),
            });
        case DPPSubmissionValidity.scoreUsesForceAR:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("scoreUsesForceAR")
                ),
            });
        case DPPSubmissionValidity.scoreUsesCustomSpeed:
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation(
                        "scoreUsesCustomSpeedMultiplier"
                    )
                ),
            });
    }

    const droidCalcResult: PerformanceCalculationResult<
        DroidDifficultyCalculator,
        DroidPerformanceCalculator
    > | null = await new DroidBeatmapDifficultyHelper().calculateScorePerformance(
        score
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    let fieldContent: string = `${score.combo}x | ${(
        score.accuracy.value() * 100
    ).toFixed(2)}% | ${score.accuracy.nmiss} ${Symbols.missIcon} | `;

    const currentTotalPP: number = bindInfo.pptotal;

    if (droidCalcResult) {
        const ppEntry: PPEntry = DPPHelper.scoreToPPEntry(
            score,
            droidCalcResult
        );

        if (DPPHelper.checkScoreInsertion(bindInfo.pp, ppEntry)) {
            await DroidBeatmapDifficultyHelper.applyTapPenalty(
                score,
                droidCalcResult
            );

            ppEntry.pp = NumberHelper.round(droidCalcResult.result.total, 2);

            DPPHelper.insertScore(bindInfo.pp, [ppEntry]);

            await bindInfo.setNewDPPValue(bindInfo.pp, 1);
        }

        const oldCalcResult: OldPerformanceCalculationResult =
            (await BeatmapOldDifficultyHelper.calculateScorePerformance(
                score
            ))!;

        const oldPPEntry: OldPPEntry = DPPHelper.scoreToOldPPEntry(
            score,
            oldCalcResult
        );

        if (oldPPInfo) {
            DPPHelper.insertScore(oldPPInfo.pp, [oldPPEntry]);

            await oldPPInfo.setNewDPPValue(oldPPInfo.pp, 1);
        } else {
            const list: Collection<string, OldPPEntry> = new Collection([
                [oldPPEntry.hash, oldPPEntry],
            ]);

            await oldPPDbManager.insert({
                discordId: interaction.user.id,
                uid: bindInfo.uid,
                username: bindInfo.username,
                playc: 1,
                pptotal: DPPHelper.calculateFinalPerformancePoints(list),
                previous_bind: bindInfo.previous_bind,
                pp: [oldPPEntry],
                weightedAccuracy: DPPHelper.calculateWeightedAccuracy(list),
            });
        }

        const dpp: number = parseFloat(droidCalcResult.result.total.toFixed(2));

        fieldContent += `${dpp}pp`;
    }

    const totalPP: number = bindInfo.pptotal;

    embed.setDescription(
        `${localization.getTranslation("totalPP")}: **${totalPP.toFixed(
            2
        )}pp**\n` +
            `${localization.getTranslation("ppGained")}: **${(
                totalPP - currentTotalPP
            ).toFixed(2)}pp**`
    );

    // Finalization
    embed.setTitle(localization.getTranslation("ppSubmissionInfo")).addFields({
        name: `${beatmapInfo.fullTitle} +${
            score.mods.map((v) => v.acronym).join(",") || "No Mod"
        }`,
        value: fieldContent,
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("submitSuccessful")
        ),
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
