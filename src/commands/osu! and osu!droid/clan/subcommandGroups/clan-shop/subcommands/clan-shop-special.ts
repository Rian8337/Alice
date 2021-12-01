import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    interaction.editReply({
        content: MessageCreator.createReject(
            clanStrings.noSpecialClanShopEvent
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
