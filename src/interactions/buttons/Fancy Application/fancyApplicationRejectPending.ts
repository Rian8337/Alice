import { FancyApplicationRejectPendingLocalization } from "@alice-localization/interactions/buttons/Fancy Application/fancyApplicationRejectPending/FancyApplicationRejectPendingLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new FancyApplicationRejectPendingLocalization(
        CommandHelper.getLocale(interaction),
    );

    ModalCreator.createModal(
        interaction,
        `fancy-application-reject-pending#${interaction.user.id}`,
        localization.getTranslation("modalTitle"),
        new TextInputBuilder()
            .setCustomId("reason")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000)
            .setLabel(localization.getTranslation("reasonLabel"))
            .setPlaceholder(localization.getTranslation("reasonPlaceholder")),
    );
};

export const config: ButtonCommand["config"] = {
    instantDeferInDebug: false,
};
