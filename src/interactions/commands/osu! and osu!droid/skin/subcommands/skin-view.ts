import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { SkinLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { User } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: SkinLocalization = new SkinLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const skinInfo: PlayerSkin | null =
        await DatabaseManager.aliceDb.collections.playerSkins.getUserSkin(user);

    if (!skinInfo) {
        return InteractionHelper.reply(interaction, {
            content:
                MessageCreator.createReject(
                    localization.getTranslation("noSkinSetForUser")
                ) + `\n\n${localization.getTranslation("tsukushiSite")}`,
        });
    }

    InteractionHelper.reply(interaction, {
        content:
            MessageCreator.createAccept(
                localization.getTranslation("userSkinInfo"),
                user.username,
                skinInfo.skin
            ) + `\n\n${localization.getTranslation("tsukushiSite")}`,
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
