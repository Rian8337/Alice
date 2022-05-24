import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
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
        interaction.options.getString("mods", true)
    );

    if (mods.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noModsDetected")
            ),
        });
    }

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

    const multiplier: number | null =
        interaction.options.getNumber("multiplier");

    let needsUpdating: boolean = false;

    for (const mod of mods) {
        if (multiplier !== null) {
            if (mod.scoreMultiplier !== multiplier) {
                needsUpdating = true;

                room.settings.modMultipliers[mod.acronym] = multiplier;
            } else if (room.settings.modMultipliers[mod.acronym]) {
                needsUpdating = true;

                delete room.settings.modMultipliers[mod.acronym];
            }
        } else if (room.settings.modMultipliers[mod.acronym]) {
            needsUpdating = true;

            delete room.settings.modMultipliers[mod.acronym];
        }
    }

    if (needsUpdating) {
        const result: OperationResult = await room.updateRoom();

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setModMultiplierFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createReject(
            localization.getTranslation("setModMultiplierSuccess"),
            mods.map((m) => m.acronym).join(", "),
            multiplier?.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ) ?? localization.getTranslation("default")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
