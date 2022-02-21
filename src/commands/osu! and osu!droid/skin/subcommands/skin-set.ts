import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { SkinLocalization } from "@alice-localization/commands/osu! and osu!droid/SkinLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const link: string = interaction.options.getString("url", true);

    await DatabaseManager.aliceDb.collections.playerSkins.insertNewSkin(
        interaction.user,
        link
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            new SkinLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("skinSet"),
            interaction.user.toString(),
            link
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
