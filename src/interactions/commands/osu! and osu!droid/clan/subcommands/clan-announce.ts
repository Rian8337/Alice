import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { TextInputComponent } from "discord.js";
import { TextInputStyles } from "discord.js/typings/enums";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    ModalCreator.createModal(
        interaction,
        "clan-announce",
        localization.getTranslation("announceModalTitle"),
        new TextInputComponent()
            .setCustomId("message")
            .setRequired(true)
            .setStyle(TextInputStyles.PARAGRAPH)
            .setMaxLength(1750)
            .setLabel(localization.getTranslation("announceModalMessageLabel"))
            .setPlaceholder(
                localization.getTranslation("announceModalMessagePlaceholder")
            )
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    instantDeferInDebug: false,
};
