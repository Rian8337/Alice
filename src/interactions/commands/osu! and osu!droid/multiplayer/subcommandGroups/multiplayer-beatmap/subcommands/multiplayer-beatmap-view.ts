import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapStats, ModUtil } from "@rian8337/osu-base";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromChannel(
            interaction.channelId,
            {
                projection: {
                    _id: 0,
                    "settings.beatmap": 1,
                    "settings.requiredMods": 1,
                    "settings.speedMultiplier": 1,
                },
            }
        );

    if (!room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomDoesntExistInChannel")
            ),
        });
    }

    if (!room.settings.beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapPickedInRoom")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    InteractionHelper.reply(
        interaction,
        EmbedCreator.createBeatmapEmbed(
            (await BeatmapManager.getBeatmap(room.settings.beatmap.id, false))!,
            new DifficultyCalculationParameters(
                new MapStats({
                    mods: ModUtil.pcStringToMods(room.settings.requiredMods),
                    speedMultiplier: room.settings.speedMultiplier,
                })
            )
        )
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
