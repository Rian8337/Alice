import { Symbols } from "@alice-enums/utils/Symbols";
import { Language } from "@alice-localization/base/Language";
import { OnboardingNavigationRowCreatorLocalization } from "@alice-localization/utils/creators/OnboardingNavigationRowCreator/OnboardingNavigationRowCreatorLocalization";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Creates action rows containing onboarding navigation buttons.
 *
 * @param currentCustomId The custom ID that the user is on.
 * @param language The language to build the row from.
 * @returns The action rows.
 */
export function createOnboardingNavigationRows(
    currentCustomId: string,
    language: Language = "en",
): ActionRowBuilder<ButtonBuilder>[] {
    const localization = new OnboardingNavigationRowCreatorLocalization(
        language,
    );

    const homeButtonId = "onboardingHome";
    const bindAccountId = "onboardingBindAccount";
    const playerProfileId = "onboardingPlayerProfile";
    const recentPlaysId = "onboardingRecentPlays";
    const scoreComparisonId = "onboardingScoreComparison";
    const performancePointsId = "onboardingPerformancePoints";

    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(homeButtonId)
                .setDisabled(
                    currentCustomId === homeButtonId ||
                        // Also disable the home button for initial button presses.
                        currentCustomId === "initialOnboarding",
                )
                .setEmoji(Symbols.house)
                .setStyle(ButtonStyle.Primary)
                .setLabel(localization.getTranslation("home")),
            new ButtonBuilder()
                .setCustomId(bindAccountId)
                .setDisabled(currentCustomId === bindAccountId)
                .setEmoji(Symbols.lockWithKey)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(localization.getTranslation("bindAccount")),
            new ButtonBuilder()
                .setCustomId(playerProfileId)
                .setDisabled(currentCustomId === playerProfileId)
                .setEmoji(Symbols.framedPicture)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(localization.getTranslation("playerProfile")),
            new ButtonBuilder()
                .setCustomId(recentPlaysId)
                .setDisabled(currentCustomId === recentPlaysId)
                .setEmoji(Symbols.bookmarkTabs)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(localization.getTranslation("recentPlays")),
            new ButtonBuilder()
                .setCustomId(scoreComparisonId)
                .setDisabled(currentCustomId === scoreComparisonId)
                .setEmoji(Symbols.barChart)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(localization.getTranslation("scoreComparison")),
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(performancePointsId)
                .setDisabled(currentCustomId === performancePointsId)
                .setEmoji(Symbols.crown)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(
                    localization.getTranslation("droidPerformancePoints"),
                ),
        ),
    ];
}
