import { Translation } from "@localization/base/Translation";
import { FancyStrings } from "../FancyLocalization";

/**
 * The English translation for the `fancy` command.
 */
export class FancyENTranslation extends Translation<FancyStrings> {
    override readonly translations: FancyStrings = {
        durationError:
            "Hey, please enter a valid duration for locking the user!",
        lockProcessFailed: "I'm sorry, I'm unable to lock the user: %s.",
        unlockProcessFailed: "I'm sorry, I'm unable to unlock the user: %s.",
        lockProcessSuccessful: "Successfully locked the user.",
        unlockProcessSuccessful: "Successfully unlocked the user.",
    };
}
