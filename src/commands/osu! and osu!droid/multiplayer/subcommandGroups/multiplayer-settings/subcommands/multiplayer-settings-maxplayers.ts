import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
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

    const maxPlayers: number = interaction.options.getInteger(
        "maxplayers",
        true
    );

    if (room.players.length > maxPlayers) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("slotHasBeenFilled")
            ),
        });
    }

    if (room.settings.maxPlayers !== maxPlayers) {
        room.settings.teamMode = maxPlayers;

        const result: OperationResult = await room.updateRoom();

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setMaxPlayerSlotFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setMaxPlayerSlotSuccess"),
            maxPlayers.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};