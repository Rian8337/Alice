import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    InteractionHelper.reply(interaction, {
        content: MessageCreator.createReject(
            new ClanLocalization(
                CommandHelper.getLocale(interaction),
            ).getTranslation("noSpecialClanShopEvent"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
