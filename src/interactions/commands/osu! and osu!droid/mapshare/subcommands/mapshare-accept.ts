import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { MapshareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (interaction.channelId !== Constants.mapShareChannel) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.notAvailableInChannelReject
                )
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound")
            ),
        });
    }

    const submission: MapShare | null =
        await DatabaseManager.aliceDb.collections.mapShare.getByBeatmapId(
            beatmapId
        );

    if (!submission) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSubmissionWithBeatmap")
            ),
        });
    }

    if (submission.status !== "pending") {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("submissionIsNotPending")
            ),
        });
    }

    const result: OperationResult = await submission.accept();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("acceptFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("acceptSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["SPECIAL"],
};
