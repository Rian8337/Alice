import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, MapStats, ModUtil } from "@rian8337/osu-base";
import { MultiplayerRESTManager } from "@alice-utils/managers/MultiplayerRESTManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    "status.isPlaying": 1,
                    "settings.roomHost": 1,
                    "settings.requiredMods": 1,
                    "settings.speedMultiplier": 1,
                },
            }
        );

    if (!room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfNotInRoom")
            ),
        });
    }

    if (room.status.isPlaying) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomIsInPlayingStatus")
            ),
        });
    }

    if (room.settings.roomHost !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (
        !NumberHelper.isNumeric(beatmapId) ||
        !NumberHelper.isPositive(beatmapId)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapProvidedIsInvalid")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(beatmapId, {
        checkFile: false,
    });

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    if (room.settings.beatmap?.hash !== beatmap.hash) {
        room.settings.beatmap = {
            id: beatmapId,
            hash: beatmap.hash,
            name: beatmap.fullTitle,
            duration: beatmap.totalLength,
        };

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
                { roomId: room.roomId },
                {
                    $set: {
                        "settings.beatmap": room.settings.beatmap,
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setBeatmapFailed")
                ),
            });
        }

        MultiplayerRESTManager.broadcastBeatmapChanged(
            room.roomId,
            room.settings.beatmap
        );
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setBeatmapSuccess"),
            beatmap.fullTitle
        ),
        ...EmbedCreator.createBeatmapEmbed(
            beatmap,
            new DifficultyCalculationParameters(
                new MapStats({
                    mods: ModUtil.pcStringToMods(room.settings.requiredMods),
                    speedMultiplier: room.settings.speedMultiplier,
                })
            ),
            localization.language
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 5,
};
