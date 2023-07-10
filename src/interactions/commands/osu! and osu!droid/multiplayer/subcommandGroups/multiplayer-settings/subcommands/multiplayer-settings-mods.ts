import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    Mod,
    ModAuto,
    ModAutopilot,
    ModPerfect,
    ModRelax,
    ModScoreV2,
    ModSuddenDeath,
    ModUtil,
} from "@rian8337/osu-base";
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
                    _id: 0,
                    "status.isPlaying": 1,
                    "settings.roomHost": 1,
                    "settings.allowedMods": 1,
                    "settings.requiredMods": 1,
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

    const requiredMods: Mod[] = ModUtil.pcStringToMods(
        interaction.options.getString("required") ?? room.settings.requiredMods
    );
    const allowedMods: Mod[] = ModUtil.pcStringToMods(
        interaction.options.getString("allowed") ?? room.settings.allowedMods,
        { checkIncompatible: false }
    );

    if (
        requiredMods.some(
            (m) =>
                m instanceof ModSuddenDeath ||
                m instanceof ModPerfect ||
                m instanceof ModRelax ||
                m instanceof ModAuto ||
                m instanceof ModAutopilot ||
                m instanceof ModScoreV2
        ) ||
        allowedMods.some(
            (m) =>
                m instanceof ModSuddenDeath ||
                m instanceof ModPerfect ||
                m instanceof ModRelax ||
                m instanceof ModAuto ||
                m instanceof ModAutopilot ||
                m instanceof ModScoreV2
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unrankedModsIncluded")
            ),
        });
    }

    let newRequiredMods: Mod[] = [];
    let newAllowedMods: Mod[] = [];

    const filterMods = (toFilter: Mod[], toRemove: Mod[]): Mod[] => {
        const newMods: Mod[] = [];

        for (const mod of toFilter) {
            if (!toRemove.some((m) => m.acronym === mod.acronym)) {
                newMods.push(mod);
            }
        }

        return newMods;
    };

    // Consider 3 different cases.
    if (
        interaction.options.getString("allowed") &&
        !interaction.options.getString("required")
    ) {
        // Case 1: Only the allowed mods are changed; in which case, remove conflicting mods from required mods
        newAllowedMods = allowedMods;
        newRequiredMods = filterMods(requiredMods, allowedMods);
    } else {
        // Case 2: Only the required mods are changed; in which case, remove conflicting mods from allowed mods
        // This also handles the case where both allowed and required mods are changed;
        // in which case, conflicting mods from allowed mods are removed as required mods have a higher precedence.
        newRequiredMods = requiredMods;
        newAllowedMods = filterMods(allowedMods, requiredMods);
    }

    room.settings.requiredMods = newRequiredMods.reduce(
        (a, m) => a + m.acronym,
        ""
    );
    room.settings.allowedMods = newAllowedMods.reduce(
        (a, m) => a + m.acronym,
        ""
    );

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.updateOne(
            { roomId: room.roomId },
            {
                $set: {
                    "settings.allowedMods": room.settings.allowedMods,
                    "settings.requiredMods": room.settings.requiredMods,
                },
            }
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setModsFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setModsSuccess"),
            room.settings.requiredMods || localization.getTranslation("none"),
            room.settings.allowedMods || localization.getTranslation("none")
        ),
    });

    MultiplayerRESTManager.broadcastRequiredModsChange(
        room.roomId,
        room.settings.requiredMods
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
