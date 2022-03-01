import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    interaction.editReply({
        content: MessageCreator.createReject(
            new ClanLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("noSpecialClanShopEvent")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
