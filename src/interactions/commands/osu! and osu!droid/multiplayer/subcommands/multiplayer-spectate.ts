import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerPlayer } from "@alice-structures/multiplayer/MultiplayerPlayer";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MultiplayerRESTManager } from "@alice-utils/managers/MultiplayerRESTManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getOne(
            {
                $and: [
                    { "players.discordId": interaction.user.id },
                    { threadChannelId: interaction.channelId },
                ],
            },
            {
                projection: {
                    _id: 0,
                    "status.isPlaying": 1,
                    "players.$": 1,
                    "settings.roomHost": 1,
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

    if (room.settings.roomHost !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
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

    const player: MultiplayerPlayer = room.players[0];

    player.isSpectating = !player.isSpectating;

    if (player.isSpectating) {
        player.isReady = false;
    }

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
            { roomId: room.roomId },
            {
                $set: {
                    "players.$[playerFilter].isReady": player.isReady,
                    "players.$[playerFilter].isSpectating": player.isSpectating,
                },
            },
            {
                arrayFilters: [
                    { "playerFilter.discordId": interaction.user.id },
                ],
            }
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("updateSpectatingStateFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("updateSpectatingStateSuccess"),
            `${player.isSpectating}`
        ),
    });

    if (player.isSpectating) {
        MultiplayerRESTManager.broadcastPlayerLeft(room.roomId, player.uid);
    } else {
        MultiplayerRESTManager.broadcastPlayerJoined(room.roomId, player);
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
