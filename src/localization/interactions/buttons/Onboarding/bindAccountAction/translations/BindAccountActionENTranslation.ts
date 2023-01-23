import { Translation } from "@alice-localization/base/Translation";
import { BindAccountActionStrings } from "../BindAccountActionLocalization";

/**
 * The English translation for the `bindAccountAction` button command.
 */
export class BindAccountActionENTranslation extends Translation<BindAccountActionStrings> {
    override readonly translations: BindAccountActionStrings = {
        bindModalTitle: "Bind an osu!droid account",
        bindModalEmailLabel: "Email",
        bindModalEmailPlaceholder:
            "The email currently connected to your osu!droid account.",
        bindModalUsernameLabel: "Username",
        bindModalUsernamePlaceholder: "The username of your osu!droid account.",
    };
}
