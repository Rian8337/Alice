import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TimeoutStrings {
    readonly userToTimeoutNotFound: string;
    readonly timeoutFailed: string;
    readonly timeoutSuccess: string;
}

/**
 * Localizations for the `timeout` command.
 */
export class TimeoutLocalization extends Localization<TimeoutStrings> {
    protected override readonly translations: Readonly<Translation<TimeoutStrings>> = {
        en: {
            userToTimeoutNotFound: "Hey, please enter a valid user to timeout!",
            timeoutFailed: "I'm sorry, I cannot timeout the user: `%s`.",
            timeoutSuccess: "Successfully timeouted the user for %s.",
        }
    };
}