import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
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
                    { channelId: interaction.channelId },
                ],
            },
            {
                projection: {
                    _id: 0,
                    channelId: 1,
                    "settings.roomHost": 1,
                    "players.discordId": 1,
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

    const playerIndex: number = room.players.findIndex(
        (v) => v.discordId === interaction.user.id
    );
    const uid = room.players[playerIndex].uid;

    room.players.splice(playerIndex, 1);

    if (room.players.length > 0) {
        const changeHost: boolean =
            room.settings.roomHost === interaction.user.id;

        if (changeHost) {
            room.settings.roomHost = ArrayHelper.getRandomArrayElement(
                room.players
            ).discordId;
        }

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
                { roomId: room.roomId },
                {
                    $pull: {
                        players: {
                            discordId: interaction.user.id,
                        },
                    },
                    $set: {
                        "settings.roomHost": room.settings.roomHost,
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("playerLeaveFailed"),
                    result.reason!
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                `${localization.getTranslation("playerLeaveSuccess")}${
                    changeHost && room.players.length > 0
                        ? `\n\n${StringHelper.formatString(
                              localization.getTranslation(
                                  "roomHostChangeNotification"
                              ),
                              `<@${room.settings.roomHost}>`
                          )}`
                        : ""
                }`
            ),
        });

        MultiplayerRESTManager.broadcastPlayerLeft(room.roomId, uid);
    } else {
        await InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("closeRoomAttempt")
            ),
        });

        await room.deleteRoom();
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
