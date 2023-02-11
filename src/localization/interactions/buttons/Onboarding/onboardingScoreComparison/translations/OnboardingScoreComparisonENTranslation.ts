import { Translation } from "@alice-localization/base/Translation";
import { chatInputApplicationCommandMention, hyperlink } from "discord.js";
import { OnboardingScoreComparisonStrings } from "../OnboardingScoreComparisonLocalization";

/**
 * The English translation for the `onboardingScoreComparison` button command.
 */
export class OnboardingScoreComparisonENTranslation extends Translation<OnboardingScoreComparisonStrings> {
    override readonly translations: OnboardingScoreComparisonStrings = {
        embedTitle: "Comparing Scores",
        scoreComparisonIntroduction:
            "Comparing your scores with other players in a beatmap has never been easier. With additional information (if available) such as pp obtained, hit error, and unstable rate (UR), there are a lot of things you can compare.",
        scoreComparisonConstraint: `This feature is accessible via the ${chatInputApplicationCommandMention(
            "compare",
            "881018535978074173"
        )} command. This only works if there is a conversation regarding a score or beatmap. Additionally, the score must be submitted to the server, which requires an osu!droid account.`,
        accountRegistrationQuote: `Don't have a registered osu!droid account yet? Register one ${hyperlink(
            "here",
            "https://osudroid.moe/user/?action=register"
        )}.`,
        compareCommandExplanation: `The ${chatInputApplicationCommandMention(
            "compare",
            "881018535978074173"
        )} command can be used to compare any scores from any player with additional information if available, such as pp obtained, hit error, and unstable rate (UR).`,
        accountBindConvenienceQuote: `The ${chatInputApplicationCommandMention(
            "compare",
            "881018535978074173"
        )} command is more convenient to use if you bind your osu!droid account to Discord account. For more information, please refer to the "Bind osu!droid account" button in the first introduction menu.`,
    };
}
