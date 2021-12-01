import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { skinStrings } from "../skinStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const link: string = <string>interaction.options.getString("url");

    await DatabaseManager.aliceDb.collections.playerSkins.insertNewSkin(
        interaction.user,
        link
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            skinStrings.skinSet,
            interaction.user.toString(),
            link
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
