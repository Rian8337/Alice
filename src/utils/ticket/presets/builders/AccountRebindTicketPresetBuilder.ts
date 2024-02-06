import { TextInputBuilder, TextInputStyle } from "discord.js";
import { BaseTicketPresetBuilder } from "./BaseTicketPresetBuilder";
import { AccountRebindTicketPresetBuilderLocalization } from "@alice-localization/utils/ticket/presets/builders/AccountRebindTicketPresetBuilder/AccountRebindTicketPresetBuilderLocalization";
import { Language } from "@alice-localization/base/Language";

/**
 * The ticket preset builder for account rebinds.
 */
export class AccountRebindTicketPresetBuilder extends BaseTicketPresetBuilder {
    protected override getTextComponents(
        language: Language,
    ): TextInputBuilder[] {
        const localization = new AccountRebindTicketPresetBuilderLocalization(
            language,
        );

        return [
            new TextInputBuilder()
                .setCustomId("username")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(20)
                .setLabel(localization.getTranslation("usernameLabel")),
            new TextInputBuilder()
                .setCustomId("email")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100)
                .setPlaceholder(localization.getTranslation("emailPlaceholder"))
                .setLabel(localization.getTranslation("emailLabel")),
            new TextInputBuilder()
                .setCustomId("reason")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1250)
                .setPlaceholder(
                    localization.getTranslation("reasonPlaceholder"),
                )
                .setLabel(localization.getTranslation("reasonLabel")),
        ];
    }
}
