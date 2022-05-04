import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WhitelistLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/whitelist/WhitelistLocalization";
import { WhitelistStatus } from "@alice-types/dpp/WhitelistStatus";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmapFound")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID || hash,
        false
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    if (!WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapDoesntNeedWhitelist")
            ),
        });
    }

    const isWhitelisted: WhitelistStatus =
        await WhitelistManager.getBeatmapWhitelistStatus(beatmapInfo.hash);

    switch (isWhitelisted) {
        case "updated":
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("whitelistedAndUpdated")
                ),
            });
            break;
        case "whitelisted":
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("whitelistedNotUpdated")
                ),
            });
            break;
        case "not whitelisted":
            InteractionHelper.reply(interaction, {
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
