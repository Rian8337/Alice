import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TextChannel, ThreadChannel } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const currentPlayerRoom: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user
        );

    if (currentPlayerRoom) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfInRoom")
            ),
        });
    }

    const id: string = interaction.options.getString("id", true);

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromId(id, { retrievePlayers: true });

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

    if (room.players.length === room.settings.maxPlayers) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomIsFull")
            ),
        });
    }

    if (
        room.settings.password &&
        room.settings.password !== interaction.options.getString("password")
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("wrongPassword")
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "selfAccountNotBinded"
                )
            ),
        });
    }

    const player: MultiplayerPlayer = {
        uid: bindInfo.uid,
        username: bindInfo.username,
        discordId: interaction.user.id,
        isReady: false,
        isSpectating: false,
    };

    if (room.settings.teamMode === MultiplayerTeamMode.teamVS) {
        // Randomize team.
        player.team = ArrayHelper.getRandomArrayElement([
            MultiplayerTeam.red,
            MultiplayerTeam.blue,
        ]);
    }

    room.players.push(player);

    const result: OperationResult = await room.updateRoom();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("joinRoomFailed")
            ),
        });
    }

    const text: TextChannel = <TextChannel>(
        await client.channels.fetch(room.textChannelId)
    );

    const thread: ThreadChannel = <ThreadChannel>(
        await text.threads.fetch(room.threadChannelId)
    );

    thread.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("joinRoomNotification"),
            interaction.user.toString()
        ),
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("joinRoomSuccess"),
            room.roomId
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
