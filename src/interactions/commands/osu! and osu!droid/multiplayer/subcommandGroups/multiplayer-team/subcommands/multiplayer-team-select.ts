import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MultiplayerPlayer } from "@alice-structures/multiplayer/MultiplayerPlayer";
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
                    "status.isPlaying": 1,
                    "settings.teamMode": 1,
                    "players.discordId": 1,
                    "players.uid": 1,
                    "players.team": 1,
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

    if (room.status.isPlaying) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomIsInPlayingStatus")
            ),
        });
    }

    if (room.settings.teamMode !== MultiplayerTeamMode.teamVS) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomInHeadToHeadMode")
            ),
        });
    }

    const team: MultiplayerTeam = <MultiplayerTeam>(
        interaction.options.getInteger("team", true)
    );

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
            { roomId: room.roomId },
            {
                $set: {
                    "players.$[playerFilter].team": team,
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
                localization.getTranslation("teamSelectFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("teamSelectSuccess"),
            room.teamToString(team, localization.language)
        ),
    });

    const player: MultiplayerPlayer | undefined = room.players.find(
        (p) => p.discordId === interaction.user.id
    );

    if (player) {
        MultiplayerRESTManager.broadcastPlayerTeamChange(
            room.roomId,
            player.uid,
            team
        );
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
