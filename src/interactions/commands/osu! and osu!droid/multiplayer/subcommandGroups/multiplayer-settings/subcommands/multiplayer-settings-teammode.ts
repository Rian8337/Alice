import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { SelectMenuInteraction } from "discord.js";

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

    const selectMenuInteraction: SelectMenuInteraction | null =
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("pickTeamMode")
                ),
            },
            (<(keyof typeof MultiplayerTeamMode)[]>(
                Object.keys(MultiplayerTeamMode)
            ))
                .map((v) => {
                    // Set the team mode to room first so we can use winConditionToString()
                    room.settings.teamMode = MultiplayerTeamMode[v];

                    return {
                        label: room.teamModeToString(),
                        value: MultiplayerTeamMode[v].toString(),
                    };
                })
                .filter((v) => v.label !== undefined)
                .sort((a, b) => a.label.localeCompare(b.label)),
            [interaction.user.id],
            20
        );

    if (!selectMenuInteraction) {
        return;
    }

    const originalTeamMode: MultiplayerTeamMode = room.settings.teamMode;

    const pickedTeamMode: MultiplayerTeamMode = parseInt(
        selectMenuInteraction.values[0]
    );

    room.settings.teamMode = originalTeamMode;

    if (originalTeamMode !== pickedTeamMode) {
        room.settings.teamMode = pickedTeamMode;

        for (const player of room.players) {
            switch (pickedTeamMode) {
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
            return InteractionHelper.update(selectMenuInteraction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setRoomTeamModeFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setRoomTeamModeSuccess"),
            room.teamModeToString(localization.language)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
