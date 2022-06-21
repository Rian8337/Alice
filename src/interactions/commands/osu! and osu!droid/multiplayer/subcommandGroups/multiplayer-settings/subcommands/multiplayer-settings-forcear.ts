import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

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

    const allowed: boolean | null = interaction.options.getBoolean("allowed");

    const minValue: number | null = interaction.options.getNumber("minvalue");

    const maxValue: number | null = interaction.options.getNumber("maxvalue");

    let needsUpdating: boolean = false;

    if (allowed !== null && room.settings.forcedAR.allowed !== allowed) {
        needsUpdating = true;

        room.settings.forcedAR.allowed = allowed;
    }

    if (minValue !== null && room.settings.forcedAR.minValue !== minValue) {
        needsUpdating = true;

        room.settings.forcedAR.minValue = minValue;
    }

    if (maxValue !== null && room.settings.forcedAR.maxValue !== maxValue) {
        needsUpdating = true;

        room.settings.forcedAR.maxValue = maxValue;
    }

    if (needsUpdating) {
        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
                { roomId: room.roomId },
                {
                    $set: {
                        "settings.forcedAR": room.settings.forcedAR,
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setForceARFailed"),
                    result.reason!
                ),
            });
        }
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setForceARSuccess"),
            localization.getTranslation(
                room.settings.forcedAR.allowed ? "allowed" : "disallowed"
            ),
            room.settings.forcedAR.minValue.toLocaleString(BCP47),
            room.settings.forcedAR.maxValue.toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
