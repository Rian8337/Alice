import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user", true);

    if (user.id === interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("cannotKickSelf")
            ),
        });
    }

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    "settings.roomHost": 1,
                    "settings.maxPlayers": 1,
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

    if (room.settings.roomHost !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
            ),
        });
    }

    const playerIndex: number = room.players.findIndex(
        (v) => v.discordId === user.id
    );

    if (playerIndex === -1) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotInRoom")
            ),
        });
    }

    room.players.splice(playerIndex, 1);

    if (interaction.options.getBoolean("lockslot")) {
        --room.settings.maxPlayers;
    }

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
            { roomId: room.roomId },
            {
                $pull: {
                    players: {
                        discordId: user.id,
                    },
                },
                $inc: {
                    "settings.maxPlayers": interaction.options.getBoolean(
                        "lockslot"
                    )
                        ? -1
                        : 0,
                },
            }
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerKickFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("playerKickSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
