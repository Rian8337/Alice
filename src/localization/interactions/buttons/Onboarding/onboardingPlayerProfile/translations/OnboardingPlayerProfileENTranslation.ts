import { Translation } from "@alice-localization/base/Translation";
import { chatInputApplicationCommandMention, hyperlink } from "discord.js";
import { OnboardingPlayerProfileStrings } from "../OnboardingPlayerProfileLocalization";

/**
 * The English translation for the `onboardingPlayerProfile` button command.
 */
export class OnboardingPlayerProfileENTranslation extends Translation<OnboardingPlayerProfileStrings> {
    override readonly translations: OnboardingPlayerProfileStrings = {
        embedTitle: "Show player profile",
        playerProfileIntroduction: `Easily show or share your profile with other players with this feature. This is accessible via the ${chatInputApplicationCommandMention(
            "profile",
            "view",
            "881019145267859536"
        )} command and the "View osu!droid Profile" button in the apps menu.`,
        playerProfileConstraint: "This feature requires an osu!droid account.",
        accountRegistrationQuote: `Don't have a registered osu!droid account yet? Register one ${hyperlink(
            "here",
            "https://osudroid.moe/user/?action=register"
        )}.`,
        profileCommandExplanation: `The ${chatInputApplicationCommandMention(
            "profile",
            "view",
            "881019145267859536"
        )} will display the profile card of a player (by default it's yourself). Options can be used to display the profile card of another player.`,
        accountBindConvenienceQuote:
            'This feature is more convenient to use if you bind your osu!droid account to Discord account. For more information, please refer to the "Bind osu!droid account" button in the first introduction menu.',
        tryCommandForBindedAccount:
            "If you have binded your osu!droid account, feel free to try the feature with the button below!",
        showOwnProfile: "Show your profile card",
    };
}
