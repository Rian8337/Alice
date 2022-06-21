import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
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

    const mods: Mod[] = ModUtil.pcStringToMods(
        interaction.options.getString("mods") ?? "",
        { checkIncompatible: false }
    );

    if (
        mods.some(
            (m) =>
                m instanceof ModSuddenDeath ||
                m instanceof ModPerfect ||
                m instanceof ModScoreV2 ||
                m instanceof ModRelax ||
                m instanceof ModAuto ||
                m instanceof ModAutopilot
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unrankedModsIncluded")
            ),
        });
    }

    if (
        mods.some((m) =>
            ModUtil.speedChangingMods.find((s) => s.acronym === m.acronym)
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("speedChangingModsIncluded")
            ),
        });
    }

    // Filter required mods with respect to allowed mods
    const requiredMods: Mod[] = [];

    for (const mod of ModUtil.pcStringToMods(room.settings.requiredMods)) {
        if (!mods.some((m) => m.acronym === mod.acronym)) {
            requiredMods.push(mod);
        }
    }

    room.settings.allowedMods = mods.reduce((a, m) => a + m.acronym, "");

    room.settings.requiredMods = requiredMods.reduce(
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
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
