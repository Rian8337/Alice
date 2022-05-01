import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user
        );

    if (!room) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfNotInRoom")
            ),
        });
    }

    if (room.status.isPlaying) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("roomIsInPlayingStatus")
            ),
        });
    }

    if (room.settings.roomHost !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
            ),
        });
    }

    const teamMode: MultiplayerTeamMode = interaction.options.getInteger(
        "teammode",
        true
    );

    if (room.settings.teamMode !== teamMode) {
        room.settings.teamMode = teamMode;

        for (const player of room.players) {
            switch (teamMode) {
                case MultiplayerTeamMode.headToHead:
                    delete player.team;
                    break;
                case MultiplayerTeamMode.teamVS:
                    // Randomize team.
                    player.team = ArrayHelper.getRandomArrayElement([
                        MultiplayerTeam.red,
                        MultiplayerTeam.blue,
                    ]);
            }
        }

        const result: OperationResult = await room.updateRoom();

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("setRoomTeamModeFailed"),
                    result.reason!
                ),
            });
        }
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("setRoomTeamModeSuccess"),
            room.teamModeToString(localization.language)
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
