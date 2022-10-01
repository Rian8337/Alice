import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { SelectMenuInteraction } from "discord.js";
import { DatabaseMultiplayerRoom } from "structures/database/aliceDb/DatabaseMultiplayerRoom";
import { UpdateFilter } from "mongodb";

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
                    "settings.teamMode": 1,
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

    const originalTeamMode: MultiplayerTeamMode = room.settings.teamMode;

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

    const pickedTeamMode: MultiplayerTeamMode = parseInt(
        selectMenuInteraction.values[0]
    );

    room.settings.teamMode = originalTeamMode;

    if (originalTeamMode !== pickedTeamMode) {
        room.settings.teamMode = pickedTeamMode;

        const query: UpdateFilter<DatabaseMultiplayerRoom> = {
            $set: {
                "settings.teamMode": pickedTeamMode,
            },
        };

        switch (pickedTeamMode) {
            case MultiplayerTeamMode.headToHead:
                query.$unset = {};
                query.$unset["players.$[].team"] = "";
                break;
            case MultiplayerTeamMode.teamVS:
                // Have to do this so that TypeScript doesn't complain
                query.$set ??= {};
                Object.defineProperty(query.$set, "players.$[].team", {
                    value: MultiplayerTeam.red,
                    configurable: true,
                    enumerable: true,
                    writable: true,
                });
        }

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
                { roomId: room.roomId },
                query
            );

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
