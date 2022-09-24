import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DPPSubmissionValidity } from "@alice-enums/utils/DPPSubmissionValidity";
import { Symbols } from "@alice-enums/utils/Symbols";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import {
    APIEmbedField,
    Collection,
    EmbedBuilder,
    GuildMember,
} from "discord.js";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPEntry } from "@alice-structures/dpp/PPEntry";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { OldPPProfileCollectionManager } from "@alice-database/managers/aliceDb/OldPPProfileCollectionManager";
import { OldPPProfile } from "@alice-database/utils/aliceDb/OldPPProfile";
import { OldPPEntry } from "@alice-structures/dpp/OldPPEntry";
import { OldPerformanceCalculationResult } from "@alice-utils/dpp/OldPerformanceCalculationResult";
import { BeatmapOldDifficultyHelper } from "@alice-utils/helpers/BeatmapOldDifficultyHelper";

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

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    if (
        await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
            player.uid
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidIsBanned")
            ),
        });
    }

    const submissionAmount: number = NumberHelper.clamp(
        interaction.options.getInteger("amount") ?? 1,
        1,
        5
    );
    const submissionOffset: number =
        interaction.options.getInteger("offset") ?? 1;

    const scoresToSubmit: Score[] = player.recentPlays.slice(
        submissionOffset - 1,
        submissionAmount + submissionOffset - 1
    );

    if (scoresToSubmit.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noScoresInSubmittedList")
            ),
        });
    }

    const droidDiffHelper: DroidBeatmapDifficultyHelper =
        new DroidBeatmapDifficultyHelper();

    const ppEntries: PPEntry[] = [];
    const oldPPEntries: OldPPEntry[] = [];
    const embedFields: APIEmbedField[] = [];

    for (const score of scoresToSubmit) {
        const beatmapInfo: MapInfo<false> | null =
            await BeatmapManager.getBeatmap(score.hash, { checkFile: false });
        const fieldTitle: string = `${beatmapInfo?.fullTitle ?? score.title} +${
            score.mods.map((v) => v.acronym).join(",") || "No Mod"
        }`;
        let fieldContent: string = `${score.combo}x | ${(
            score.accuracy.value() * 100
        ).toFixed(2)}% | ${score.accuracy.nmiss} ${Symbols.missIcon} | **`;

        if (!beatmapInfo) {
            embedFields.push({
                name: fieldTitle,
                value:
                    fieldContent +
                    localization.getTranslation("beatmapNotFoundReject") +
                    "**",
            });
            continue;
        }

        // PP
        const submissionValidity: DPPSubmissionValidity =
            await DPPHelper.checkSubmissionValidity(score);

        switch (submissionValidity) {
            case DPPSubmissionValidity.beatmapIsBlacklisted:
                fieldContent += localization.getTranslation(
                    "blacklistedBeatmapReject"
                );
                break;
            case DPPSubmissionValidity.beatmapNotWhitelisted:
                fieldContent += localization.getTranslation(
                    "unrankedBeatmapReject"
                );
                break;
            case DPPSubmissionValidity.beatmapTooShort:
                fieldContent += localization.getTranslation(
                    "beatmapTooShortReject"
                );
                break;
            case DPPSubmissionValidity.scoreUsesForceAR:
            case DPPSubmissionValidity.scoreUsesCustomSpeed:
                fieldContent += localization.getTranslation(
                    "unrankedFeaturesReject"
                );
                break;
            default: {
                const droidCalcResult: PerformanceCalculationResult<
                    DroidDifficultyCalculator,
                    DroidPerformanceCalculator
                > | null = await droidDiffHelper.calculateScorePerformance(
                    score
                );

                if (!droidCalcResult) {
                    fieldContent += localization.getTranslation(
                        "beatmapNotFoundReject"
                    );
                    break;
                }

                const ppEntry: PPEntry = DPPHelper.scoreToPPEntry(
                    score,
                    droidCalcResult
                );

                if (DPPHelper.checkScoreInsertion(bindInfo.pp, ppEntry)) {
                    await DroidBeatmapDifficultyHelper.applyTapPenalty(
                        score,
                        droidCalcResult
                    );

                    ppEntry.pp = NumberHelper.round(
                        droidCalcResult.result.total,
                        2
                    );
                }

                ppEntries.push(ppEntry);

                const oldCalcResult: OldPerformanceCalculationResult =
                    (await BeatmapOldDifficultyHelper.calculateScorePerformance(
                        score
                    ))!;

                oldPPEntries.push(
                    DPPHelper.scoreToOldPPEntry(score, oldCalcResult)
                );

                const dpp: number = parseFloat(
                    droidCalcResult.result.total.toFixed(2)
                );

                fieldContent += `${dpp}pp`;
            }
        }

        fieldContent += "**";

        embedFields.push({ name: fieldTitle, value: fieldContent });
    }

    // Finalization
    const oldPPScores: Collection<string, OldPPEntry> =
        oldPPInfo?.pp ?? new Collection();

    DPPHelper.insertScore(bindInfo.pp, ppEntries);
    DPPHelper.insertScore(oldPPScores, oldPPEntries);

    const totalPP: number = DPPHelper.calculateFinalPerformancePoints(
        bindInfo.pp
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setDescription(
            `${localization.getTranslation("totalPP")}: **${totalPP.toFixed(
                2
            )}pp**\n` +
                `${localization.getTranslation("ppGained")}: **${(
                    totalPP - bindInfo.pptotal
                ).toFixed(2)}pp**`
        )
        .addFields(embedFields);

    await bindInfo.setNewDPPValue(bindInfo.pp, scoresToSubmit.length);

    if (oldPPInfo) {
        await oldPPInfo.setNewDPPValue(oldPPInfo.pp, 1);
    } else {
        await oldPPDbManager.insert({
            discordId: interaction.user.id,
            uid: bindInfo.uid,
            username: bindInfo.username,
            playc: 1,
            pptotal: DPPHelper.calculateFinalPerformancePoints(oldPPScores),
            previous_bind: bindInfo.previous_bind,
            pp: [...oldPPScores.values()],
            weightedAccuracy: DPPHelper.calculateWeightedAccuracy(oldPPScores),
        });
    }

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
