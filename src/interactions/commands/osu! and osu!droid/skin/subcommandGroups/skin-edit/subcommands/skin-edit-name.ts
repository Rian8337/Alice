import { DatabaseManager } from "@database/DatabaseManager";
import { PlayerSkin } from "@database/utils/aliceDb/PlayerSkin";
import { SkinLocalization } from "@localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { OperationResult } from "@structures/core/OperationResult";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: SkinLocalization = new SkinLocalization(
        CommandHelper.getLocale(interaction),
    );

    const skin: PlayerSkin | null =
        await DatabaseManager.aliceDb.collections.playerSkins.getFromName(
            interaction.options.getString("name", true),
        );

    if (!skin) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("skinNotFound"),
            ),
        });
    }

    if (
        // Allow bot owners to edit skins.
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        skin.discordid !== interaction.user.id
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("skinNotOwnedByUser"),
            ),
        });
    }

    const newName: string = interaction.options.getString("newname", true);

    if (StringHelper.hasUnicode(newName)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidSkinName"),
            ),
        });
    }

    if (
        await DatabaseManager.aliceDb.collections.playerSkins.checkSkinNameAvailability(
            interaction.user,
            newName,
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("skinNameNotAvailable"),
            ),
        });
    }

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.playerSkins.updateOne(
            { name: skin.name },
            {
                $set: {
                    name: newName,
                },
            },
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("editSkinFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("editSkinSuccess"),
        ),
    });
};
