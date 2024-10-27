import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { MapShare } from "@database/utils/aliceDb/MapShare";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { BaseMessageOptions } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MapshareLocalization } from "@localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (interaction.channelId !== Constants.mapShareChannel) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.notAvailableInChannelReject,
                ),
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true),
    )[0];

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapFound"),
            ),
        });
    }

    const submission: MapShare | null =
        await DatabaseManager.aliceDb.collections.mapShare.getByBeatmapId(
            beatmapId,
        );

    if (!submission) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSubmissionWithBeatmap"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapId,
        { checkFile: false },
    );

    if (
        !beatmapInfo ||
        (beatmapInfo.hash !== submission.hash &&
            submission.status !== "pending")
    ) {
        await submission.delete();

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapIsOutdated"),
            ),
        });
    }

    const embedOptions: BaseMessageOptions =
        (await EmbedCreator.createMapShareEmbed(
            submission,
            localization.language,
        ))!;

    InteractionHelper.reply(interaction, embedOptions);
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
