import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WhitelistLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/whitelist/WhitelistLocalization";
import { WhitelistStatus } from "structures/dpp/WhitelistStatus";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { WhitelistManager } from "@utils/managers/WhitelistManager";
import { MapInfo } from "@rian8337/osu-base";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: WhitelistLocalization = new WhitelistLocalization(
        CommandHelper.getLocale(interaction),
    );

    // Prioritize beatmap ID over hash
    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? "",
    )[0];
    const hash: string = BeatmapManager.getChannelLatestBeatmap(
        interaction.channelId,
    )!;

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCachedBeatmapFound"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID || hash,
        { checkFile: false },
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    if (!WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapDoesntNeedWhitelist"),
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
                    localization.getTranslation("whitelistedAndUpdated"),
                ),
            });
            break;
        case "whitelisted":
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("whitelistedNotUpdated"),
                ),
            });
            break;
        case "not whitelisted":
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("whitelistStatus"),
                    beatmapInfo.fullTitle,
                    localization.getTranslation("notWhitelisted"),
                ),
            });
            break;
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
