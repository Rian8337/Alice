import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { MathUtils, Precision } from "@rian8337/osu-base";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { Config } from "@alice-core/Config";

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
                    "settings.speedMultiplier": 1,
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

    const value: number = MathUtils.round(
        interaction.options.getNumber("value") ?? 1,
        2
    );

    if (!Precision.almostEqualsNumber((value * 100) % 5, 0)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("speedMultiplierNotDivisible")
            ),
        });
    }

    if (room.settings.speedMultiplier !== value) {
        room.settings.speedMultiplier = value;

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
                { roomId: room.roomId },
                {
                    $set: {
                        "settings.speedMultiplier":
                            room.settings.speedMultiplier,
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setSpeedMultiplierFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setSpeedMultiplierSuccess"),
            room.settings.speedMultiplier.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });

    RESTManager.request(
        Config.isDebug
            ? "https://droidpp.osudroid.moe/api/droid/events/speedMultiplierChange"
            : "https://localhost:3001/api/droid/events/speedMultiplierChange",
        {
            method: "POST",
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                roomId: room.roomId,
                value: value,
            },
            headers: {
                "Content-Type": "application/json",
            },
            json: true,
        }
    )
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
