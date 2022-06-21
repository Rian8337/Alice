import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { RequestResponse } from "@rian8337/osu-base";
import { RESTManager } from "@alice-utils/managers/RESTManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
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

    if (room.settings.roomHost !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
            ),
        });
    }

    if (!CacheManager.multiplayerTimers.has(room.textChannelId)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTimerSet")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const response: RequestResponse = await RESTManager.request(
        "https://droidppboard.herokuapp.com/api/droid/stopPlaying",
        {
            method: "POST",
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                roomId: room.roomId,
            },
        }
    );

    if (response.statusCode !== 200) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("timerStopFailed"),
                JSON.parse(response.data.toString()).message
            ),
        });
    }

    room.status.isPlaying = false;

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
            { roomId: room.roomId },
            {
                $set: {
                    "status.isPlaying": room.status.isPlaying,
                },
            }
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("timerStopFailed"),
                result.reason!
            ),
        });
    }

    const timeouts: NodeJS.Timeout[] = CacheManager.multiplayerTimers.get(
        room.textChannelId
    )!;

    for (const timeout of timeouts) {
        clearTimeout(timeout);
    }

    CacheManager.multiplayerTimers.delete(room.textChannelId);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("timerStopSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
