import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Constants } from "@alice-core/Constants";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { MapInfo } from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPSubmissionStatus } from "@alice-structures/dpp/PPSubmissionStatus";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { EmbedBuilder, GuildMember, bold } from "discord.js";
import { Symbols } from "@alice-enums/utils/Symbols";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: PPLocalization = new PPLocalization(
        await CommandHelper.getLocale(interaction)
    );

    await InteractionHelper.deferReply(interaction);

    const bindDbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const bindInfo: UserBind | null = await bindDbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                uid: 1,
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

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
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

    const statuses: PPSubmissionStatus[] | null =
        await DPPProcessorRESTManager.submitScores(bindInfo.uid, [
            score.scoreID,
        ]);

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(localization.getTranslation("ppSubmissionInfo")).addFields({
        name: `${beatmapInfo?.fullTitle ?? score.title} +${
            score.completeModString
        }`,
        value: `${score.combo}x | ${(score.accuracy.value() * 100).toFixed(
            2
        )}% | ${score.accuracy.nmiss} ${Symbols.missIcon} | ${bold(
            `${NumberHelper.round(statuses?.[0]?.pp ?? 0, 2)}pp`
        )} | ${bold(
            statuses?.[0]?.success
                ? "Success"
                : statuses?.[0].reason ?? "Unknown"
        )}`,
    });

    if (!statuses || statuses.length === 0 || !statuses[0].success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("submitFailed")
            ),
            embeds: [embed],
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept("Submission success."),
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
