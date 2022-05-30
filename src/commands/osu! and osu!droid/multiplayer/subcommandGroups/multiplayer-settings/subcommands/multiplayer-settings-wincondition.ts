import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user
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

    const originalWinCondition: MultiplayerWinCondition =
        room.settings.winCondition;

    const pickedWinCondition: MultiplayerWinCondition = parseInt(
        (
            await SelectMenuCreator.createSelectMenu(
                interaction,
                {
                    content: MessageCreator.createWarn(
                        localization.getTranslation("pickWinCondition")
                    ),
                },
                (<(keyof typeof MultiplayerWinCondition)[]>(
                    Object.keys(MultiplayerWinCondition)
                ))
                    .map((v) => {
                        // Set the win condition to room first so we can use winConditionToString()
                        room.settings.winCondition = MultiplayerWinCondition[v];

                        return {
                            label: room.winConditionToString(),
                            value: MultiplayerWinCondition[v].toString(),
                        };
                    })
                    .filter((v) => v.label !== undefined)
                    .sort((a, b) => a.label.localeCompare(b.label)),
                [interaction.user.id],
                20
            )
        )[0]
    );

    if (isNaN(pickedWinCondition)) {
        return;
    }

    room.settings.winCondition = originalWinCondition;

    if (originalWinCondition !== pickedWinCondition) {
        room.settings.winCondition = pickedWinCondition;

        const result: OperationResult = await room.updateRoom();

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setRoomWinConditionFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setRoomWinConditionSuccess"),
            room.winConditionToString(localization.language)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
