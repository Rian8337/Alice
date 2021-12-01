import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerSkin } from "@alice-database/utils/aliceDb/PlayerSkin";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { skinStrings } from "../skinStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const permaSkinLink: string = "https://tsukushi.site/";

    const skinInfo: PlayerSkin | null =
        await DatabaseManager.aliceDb.collections.playerSkins.getUserSkin(user);

    if (!skinInfo) {
        return interaction.editReply({
            content:
                MessageCreator.createReject(skinStrings.noSkinSetForUser) +
                `\n\nFor a collection of skins, visit <${permaSkinLink}>`,
        });
    }

    interaction.editReply({
        content:
            MessageCreator.createAccept(
                skinStrings.userSkinInfo,
                user.username,
                skinInfo.skin
            ) + `\n\nFor a collection of skins, visit <${permaSkinLink}>`,
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
