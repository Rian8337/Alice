import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { bold, GuildMember } from "discord.js";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { PPSubmissionStatus } from "@alice-structures/dpp/PPSubmissionStatus";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { OfficialDatabaseScore } from "@alice-database/official/schema/OfficialDatabaseScore";
import { Accuracy } from "@rian8337/osu-base";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new PPLocalization(
        await CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const bindDbManager = DatabaseManager.elainaDb.collections.userBind;

    const bindInfo = await bindDbManager.getFromUser(interaction.user, {
        projection: {
            _id: 0,
            uid: 1,
        },
    });

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(bindInfo.uid, ["id"]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    if (
        await DatabaseManager.elainaDb.collections.dppBan.isPlayerBanned(
            player instanceof Player ? player.uid : player.id,
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidIsBanned"),
            ),
        });
    }

    const submissionAmount = NumberHelper.clamp(
        interaction.options.getInteger("amount") ?? 1,
        1,
        5,
    );
    const submissionOffset = interaction.options.getInteger("offset") ?? 1;
    let scoresToSubmit: (
        | Pick<
              OfficialDatabaseScore,
              | "id"
              | "mode"
              | "combo"
              | "perfect"
              | "good"
              | "bad"
              | "miss"
              | "filename"
          >
        | Score
    )[];

    if (player instanceof Player) {
        scoresToSubmit = player.recentPlays.slice(
            submissionOffset - 1,
            submissionAmount + submissionOffset - 1,
        );
    } else {
        scoresToSubmit = await DroidHelper.getRecentScores(
            player.id,
            submissionAmount,
            submissionOffset - 1,
            [
                "id",
                "mode",
                "combo",
                "perfect",
                "good",
                "bad",
                "miss",
                "filename",
            ],
        );
    }

    if (scoresToSubmit.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noScoresInSubmittedList"),
            ),
        });
    }

    const result = await DPPProcessorRESTManager.submitScores(
        bindInfo.uid,
        scoresToSubmit.map((v) => (v instanceof Score ? v.scoreID : v.id)),
    );

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const BCP47 = LocaleHelper.convertToBCP47(localization.language);

    embed
        .setTitle(localization.getTranslation("ppSubmissionInfo"))
        .setDescription(
            `${localization.getTranslation("totalPP")}: ${bold(
                (result?.newTotalPP ?? 0).toLocaleString(BCP47),
            )}pp\n` +
                `${localization.getTranslation("ppGained")}: ${bold(
                    (result?.ppGained ?? 0).toLocaleString(BCP47),
                )}pp`,
        )
        .addFields(
            (
                result?.statuses ??
                new Array<PPSubmissionStatus | undefined>(scoresToSubmit.length)
            ).map((status, i) => {
                const score = scoresToSubmit[i];
                const title =
                    score instanceof Score
                        ? score.title
                        : DroidHelper.cleanupFilename(score.filename);

                const modstring =
                    score instanceof Score
                        ? score.completeModString
                        : DroidHelper.getCompleteModString(score.mode);

                const accuracy =
                    score instanceof Score
                        ? score.accuracy
                        : new Accuracy({
                              n300: score.perfect,
                              n100: score.good,
                              n50: score.bad,
                              nmiss: score.miss,
                          });

                return {
                    name: `${title} ${modstring}`,
                    value: `${score.combo}x | ${(
                        accuracy.value() * 100
                    ).toFixed(2)}% | ${accuracy.nmiss} ${
                        Symbols.missIcon
                    } | ${bold(
                        `${NumberHelper.round(status?.pp ?? 0, 2)}pp`,
                    )} | ${bold(
                        status?.success
                            ? "Success"
                            : status?.reason ?? "Unknown",
                    )}`,
                };
            }),
        );

    if (result === null || result.statuses.every((s) => !s.success)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("submitFailed"),
            ),
            embeds: [embed],
        });
    }

    if (result.statuses.some((s) => !s.success)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("partialSubmitSuccessful"),
            ),
            embeds: [embed],
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("fullSubmitSuccessful"),
        ),
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
