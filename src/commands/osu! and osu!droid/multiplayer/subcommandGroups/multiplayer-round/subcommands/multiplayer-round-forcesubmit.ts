import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { MapStats, ModUtil } from "@rian8337/osu-base";
import { MessageEmbed } from "discord.js";

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

    if (!room.status.isPlaying) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("roomIsNotInPlayingStatus")
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

    const stats: MapStats = new MapStats({
        mods: ModUtil.pcStringToMods(room.settings.requiredMods),
        speedMultiplier: room.settings.speedMultiplier,
    }).calculate();

    if (
        Date.now() - room.status.playingSince <
        (room.settings.beatmap!.duration / stats.speedMultiplier + 30) * 1000
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFinished")
            ),
        });
    }

    const embed: MessageEmbed =
        await EmbedCreator.createMultiplayerRoomRoundResultEmbed(
            room,
            localization.language
        );

    for (const player of room.players) {
        player.isReady = false;
    }

    room.status.isPlaying = false;
    room.currentScores = [];
    room.status.playingSince = Date.now();

    const result: OperationResult = await room.updateRoom();

    if (!result.success) {
        return interaction.channel!.send({
            content: MessageCreator.createReject(
                localization.getTranslation("matchStatusUpdateFailed"),
                result.reason!
            ),
        });
    }

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("matchStatusUpdateSuccess")
        ),
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
