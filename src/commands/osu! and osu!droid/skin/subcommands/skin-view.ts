import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { SkinLocalization } from "@alice-localization/commands/osu! and osu!droid/SkinLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: SkinLocalization = new SkinLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const skinInfo: PlayerSkin | null =
        await DatabaseManager.aliceDb.collections.playerSkins.getUserSkin(user);

    if (!skinInfo) {
        return interaction.editReply({
            content:
                MessageCreator.createReject(
                    localization.getTranslation("noSkinSetForUser")
                ) + `\n\n${localization.getTranslation("tsukushiSite")}`,
        });
    }

    interaction.editReply({
        content:
            MessageCreator.createAccept(
                localization.getTranslation("userSkinInfo"),
                user.username,
                skinInfo.skin
            ) + `\n\n${localization.getTranslation("tsukushiSite")}`,
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
