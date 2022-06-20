import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { SkinLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const link: string = interaction.options.getString("url", true);

    await DatabaseManager.aliceDb.collections.playerSkins.insertNewSkin(
        interaction.user,
        link
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new SkinLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("skinSet"),
            interaction.user.toString(),
            link
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
