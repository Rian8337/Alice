import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { SkinLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

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

    const url: string = interaction.options.getString("link", true);

    if (!StringHelper.isValidURL(url)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidSkinLink"),
            ),
        });
    }

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.playerSkins.updateOne(
            { name: skin.name },
            {
                $set: {
                    url: url,
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

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
