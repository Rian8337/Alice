import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DailyLocalization } from "@alice-localization/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo } from "@rian8337/osu-base";
import { MessageAttachment } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("id", true)
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
        challenge.beatmapid,
        false
    );

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const beatmapFile: string | null = await challenge.getBeatmapFile();

    if (!beatmapFile) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapDownloadFailed")
            ),
        });
    }

    const attachment: MessageAttachment = new MessageAttachment(
        beatmapFile,
        `${beatmap.artist} - ${beatmap.title} (${beatmap.creator}) [(${
            challenge.isWeekly ? "Weekly " : ""
        } Challenge ${challenge.challengeid}) ${beatmap.version}].osu`
    );

    InteractionHelper.reply(interaction, {
        files: [attachment],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
