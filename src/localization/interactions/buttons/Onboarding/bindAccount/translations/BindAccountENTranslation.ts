import { Translation } from "@alice-localization/base/Translation";
import { BindAccountStrings } from "../BindAccountLocalization";

/**
 * The English translation for the `bindAccount` button command.
 */
export class BindAccountENTranslation extends Translation<BindAccountStrings> {
    override readonly translations: BindAccountStrings = {
        bindAccountEmbedTitle: "Bind an osu!droid account",
        bindingDefinition:
            "Bind your osu!droid account to your Discord account to use most of the features that I offer.",
        bindingConstraints:
            "An osu!droid account can only binded to a Discord account. Additionally, a Discord account can only bind up to 2 osu!droid accounts.",
        bindingRequirement:
            "To use this feature, you must have a registered osu!droid account.",
        accountRegistrationQuote:
            "Don't have a registered osu!droid account yet? Register one [here](https://osudroid.moe/user/?action=register).",
        bindingProcedure:
            "To bind your osu!droid account, press the button below. You will be prompted to enter the email and username of your osu!droid account to verify your ownership of the account.",
        furtherBindQuote:
            "Should you want to bind an osu!droid account in the future, feel free to use the </userbind uid:881019231863468083> or </userbind username:881019231863468083> command.",
    };
}
