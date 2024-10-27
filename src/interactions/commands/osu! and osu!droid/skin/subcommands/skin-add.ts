import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SkinLocalization } from "@localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { OperationResult } from "@structures/core/OperationResult";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: SkinLocalization = new SkinLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const link: string = interaction.options.getString("link", true);

    if (StringHelper.hasUnicode(name)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidSkinName"),
            ),
        });
    }

    if (
        await DatabaseManager.aliceDb.collections.playerSkins.checkSkinNameAvailability(
            interaction.user,
            name,
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("skinNameNotAvailable"),
            ),
        });
    }

    if (!StringHelper.isValidURL(link)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidSkinLink"),
            ),
        });
    }

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.playerSkins.insert({
            discordid: interaction.user.id,
            name: name,
            url: link,
        });

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addSkinFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addSkinSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
