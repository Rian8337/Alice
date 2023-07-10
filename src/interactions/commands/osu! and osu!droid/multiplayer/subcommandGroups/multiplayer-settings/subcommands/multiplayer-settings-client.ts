import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerClientType } from "@alice-enums/multiplayer/MultiplayerClientType";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ModUtil } from "@rian8337/osu-base";

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
                    "settings.allowedMods": 1,
                    "settings.clientType": 1,
                    "settings.forcedAR.allowed": 1,
                    "settings.requiredMods": 1,
                    "settings.roomHost": 1,
                    "settings.useSliderAccuracy": 1,
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

    const clientType: MultiplayerClientType = <MultiplayerClientType>(
        interaction.options.getInteger("type", true)
    );
    const isOfficial: boolean = clientType === MultiplayerClientType.official;

    if (room.settings.clientType !== clientType) {
        if (isOfficial) {
            // Remove unranked mods.
            const filterMods = (str: string): string =>
                ModUtil.pcStringToMods(str)
                    .filter((v) => v.isApplicableToDroid() && v.droidRanked)
                    .reduce((a, v) => a + v.acronym, "");

            room.settings.allowedMods = filterMods(room.settings.allowedMods);
            room.settings.requiredMods = filterMods(room.settings.requiredMods);
        }

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
                { roomId: room.roomId },
                {
                    $set: {
                        "settings.allowedMods": room.settings.allowedMods,
                        "settings.clientType": clientType,
                        "settings.forcedAR.allowed": isOfficial
                            ? false
                            : room.settings.forcedAR.allowed,
                        "settings.requiredMods": room.settings.requiredMods,
                        "settings.useSliderAccuracy": isOfficial
                            ? false
                            : room.settings.useSliderAccuracy,
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setClientTypeFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setClientTypeSuccess"),
            room.clientTypeToString(localization.language)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
