import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WhitelistStatus } from "@alice-types/dpp/WhitelistStatus";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { MapInfo } from "@rian8337/osu-base";
import { whitelistStrings } from "../whitelistStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
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
                whitelistStrings.noCachedBeatmapFound
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
                whitelistStrings.beatmapNotFound
            ),
        });
    }

    if (!WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                whitelistStrings.beatmapDoesntNeedWhitelist
            ),
        });
    }

    const isWhitelisted: WhitelistStatus =
        await WhitelistManager.getBeatmapWhitelistStatus(beatmapInfo.hash);

    switch (isWhitelisted) {
        case "updated":
            interaction.editReply({
                content: MessageCreator.createAccept(
                    whitelistStrings.whitelistStatus,
                    beatmapInfo.fullTitle,
                    "whitelisted and updated"
                ),
            });
            break;
        case "whitelisted":
            interaction.editReply({
                content: MessageCreator.createAccept(
                    whitelistStrings.whitelistStatus,
                    beatmapInfo.fullTitle,
                    "whitelisted, but not updated"
                ),
            });
            break;
        case "not whitelisted":
            interaction.editReply({
                content: MessageCreator.createAccept(
                    whitelistStrings.whitelistStatus,
                    beatmapInfo.fullTitle,
                    "not whitelisted"
                ),
            });
            break;
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
