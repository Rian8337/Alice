import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface FancyStrings {
    readonly durationError: string;
    readonly lockProcessFailed: string;
    readonly lockProcessSuccessful: string;
    readonly unlockProcessFailed: string;
    readonly unlockProcessSuccessful: string;
}

/**
 * Localizations for the `fancy` command.
 */
export class FancyLocalization extends Localization<FancyStrings> {
    protected override readonly translations: Readonly<
        Translation<FancyStrings>
    > = {
            en: {
                durationError:
                    "Hey, please enter a valid duration for locking the user!",
                lockProcessFailed: "I'm sorry, I'm unable to lock the user: %s.",
                unlockProcessFailed:
                    "I'm sorry, I'm unable to unlock the user: %s.",
                lockProcessSuccessful: "Successfully locked the user.",
                unlockProcessSuccessful: "Successfully unlocked the user.",
            },
        };
}
