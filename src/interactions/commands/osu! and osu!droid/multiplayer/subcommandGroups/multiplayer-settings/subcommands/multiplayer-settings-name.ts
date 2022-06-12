import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TextChannel, ThreadChannel } from "discord.js";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
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

    const name: string = interaction.options.getString("name", true);

    if (name.length > 50) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("nameTooLong")
            ),
        });
    }

    if (room.settings.roomName !== name) {
        room.settings.roomName = name;

        const result: OperationResult = await room.updateRoom();

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setRoomNameFailed"),
                    result.reason!
                ),
            });
        }

        const text: TextChannel = <TextChannel>(
            await client.channels.fetch(room.textChannelId)
        );

        const thread: ThreadChannel = <ThreadChannel>(
            await text.threads.fetch(room.threadChannelId)
        );

        await thread.setName(
            `${localization.getTranslation("multiplayerRoomPrefix")} — ${
                room.roomId
            } - ${room.settings.roomName}`,
            "Host renamed multiplayer room"
        );
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setRoomNameSuccess"),
            name
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
