import { Translation } from "@localization/base/Translation";
import {
    bold,
    chatInputApplicationCommandMention,
    hyperlink,
} from "discord.js";
import { OnboardingBindAccountStrings } from "../OnboardingBindAccountLocalization";

/**
 * The English translation for the `onboardingBindAccount` button command.
 */
export class OnboardingBindAccountENTranslation extends Translation<OnboardingBindAccountStrings> {
    override readonly translations: OnboardingBindAccountStrings = {
        bindAccountEmbedTitle: "Bind an osu!droid account",
        bindingDefinition:
            "Bind your osu!droid account to your Discord account to use most of the features that I offer.",
        bindingConstraints:
            "An osu!droid account can only be bound to a Discord account. Additionally, a Discord account can only bind up to 2 osu!droid accounts.",
        bindingRequirement:
            "To use this feature, you must have a registered osu!droid account.",
        accountRegistrationQuote: `Don't have a registered osu!droid account yet? Register one ${hyperlink(
            "here",
            "https://osudroid.moe/user/?action=register",
        )}.`,
        bindingProcedure: `To bind your osu!droid account, press the button below. You will be prompted to enter the email and username of your osu!droid account to verify your ownership of the account. ${bold(
            "Do not worry, your information is not stored!",
        )}`,
        furtherBindQuote: `You may also use the ${chatInputApplicationCommandMention(
            "userbind",
            "uid",
            "881019231863468083",
        )} or ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "881019231863468083",
        )} commands to access this feature. The first command identifies your osu!droid account by its uid, while the second command identifies your osu!droid account by its username.`,
    };
}
