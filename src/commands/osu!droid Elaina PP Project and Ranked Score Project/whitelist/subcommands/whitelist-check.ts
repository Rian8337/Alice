import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WhitelistLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/WhitelistLocalization";
import { WhitelistStatus } from "@alice-types/dpp/WhitelistStatus";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { MapInfo } from "@rian8337/osu-base";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: WhitelistLocalization = new WhitelistLocalization(
        await CommandHelper.getLocale(interaction)
    );

    // Prioritize beatmap ID over hash
    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? ""
    )[0];
    const hash: string = BeatmapManager.getChannelLatestBeatmap(
        interaction.channel!.id
    )!;

    if (!beatmapID && !hash) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmapFound")
            ),
        });
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID || hash,
        false
    );

    if (!beatmapInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    if (!WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapDoesntNeedWhitelist")
            ),
        });
    }

    const isWhitelisted: WhitelistStatus =
        await WhitelistManager.getBeatmapWhitelistStatus(beatmapInfo.hash);

    switch (isWhitelisted) {
        case "updated":
            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("whitelistedAndUpdated")
                ),
            });
            break;
        case "whitelisted":
            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("whitelistedNotUpdated")
                ),
            });
            break;
        case "not whitelisted":
            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("notWhitelisted")
                ),
            });
            break;
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
