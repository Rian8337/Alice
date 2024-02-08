import { Symbols } from "@alice-enums/utils/Symbols";
import { Language } from "@alice-localization/base/Language";
import { SupportTicketGuideButtonCreatorLocalization } from "@alice-localization/utils/ticket/SupportTicketGuideButtonCreator/SupportTicketGuideButtonCreatorLocalization";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Creates action rows containing support ticket guide buttons.
 *
 * @param currentCustomId The custom ID that the user is on.
 * @param language The language to build the row from.
 * @returns The action rows.
 */
export function createSupportTicketGuideButton(
    currentCustomId: string,
    language: Language = "en",
): ActionRowBuilder<ButtonBuilder>[] {
    const localization = new SupportTicketGuideButtonCreatorLocalization(
        language,
    );

    const homeButtonId = "supportTicketGuideHome";
    const purposeButtonId = "supportTicketGuidePurpose";
    const writingTicketButtonId = "supportTicketGuideCreation";
    const ticketPresetsButtonId = "supportTicketGuidePresets";
    const dosAndDontsButtonId = "supportTicketGuideDosDonts";

    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(homeButtonId)
                .setDisabled(
                    currentCustomId === homeButtonId ||
                        // Also disable the home button for initial button presses.
                        currentCustomId === "initialSupportTicketGuide",
                )
                .setStyle(ButtonStyle.Primary)
                .setEmoji(Symbols.house)
                .setLabel(localization.getTranslation("homeButton")),
            new ButtonBuilder()
                .setCustomId(purposeButtonId)
                .setDisabled(currentCustomId === purposeButtonId)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(Symbols.wrench)
                .setLabel(localization.getTranslation("purposeButton")),
            new ButtonBuilder()
                .setCustomId(writingTicketButtonId)
                .setDisabled(currentCustomId === writingTicketButtonId)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(Symbols.memo)
                .setLabel(localization.getTranslation("writingTicketButton")),
            new ButtonBuilder()
                .setCustomId(ticketPresetsButtonId)
                .setDisabled(currentCustomId === ticketPresetsButtonId)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(Symbols.bookmarkTabs)
                .setLabel(localization.getTranslation("ticketPresetsButton")),
            new ButtonBuilder()
                .setCustomId(dosAndDontsButtonId)
                .setDisabled(currentCustomId === dosAndDontsButtonId)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(Symbols.bookmarkTabs)
                .setLabel(localization.getTranslation("dosAndDontsButton")),
        ),
    ];
}
