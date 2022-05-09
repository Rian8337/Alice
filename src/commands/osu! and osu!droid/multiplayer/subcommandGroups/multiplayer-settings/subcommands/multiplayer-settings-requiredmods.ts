import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
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

export const run: Subcommand["run"] = async (_, interaction) => {
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

    const mods: Mod[] = ModUtil.pcStringToMods(
        interaction.options.getString("mods") ?? ""
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

    // Filter allowed mods with respect to required mods
    const allowedMods: Mod[] = [];

    for (const mod of ModUtil.pcStringToMods(room.settings.allowedMods)) {
        if (!mods.some((m) => m.acronym === mod.acronym)) {
            allowedMods.push(mod);
        }
    }

    room.settings.requiredMods = mods.reduce((a, m) => a + m.acronym, "");

    room.settings.allowedMods = allowedMods.reduce((a, m) => a + m.acronym, "");

    const result: OperationResult = await room.updateRoom();

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
            room.settings.requiredMods,
            room.settings.allowedMods
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
