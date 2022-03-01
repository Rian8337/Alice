import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TimeoutENTranslation } from "./translations/TimeoutENTranslation";
import { TimeoutIDTranslation } from "./translations/TimeoutIDTranslation";
import { TimeoutKRTranslation } from "./translations/TimeoutKRTranslation";

export interface TimeoutStrings {
    readonly userToTimeoutNotFound: string;
    readonly timeoutFailed: string;
    readonly timeoutSuccess: string;
}

/**
 * Localizations for the `timeout` command.
 */
export class TimeoutLocalization extends Localization<TimeoutStrings> {
    protected override readonly localizations: Readonly<
        Translations<TimeoutStrings>
    > = {
        en: new TimeoutENTranslation(),
        kr: new TimeoutKRTranslation(),
        id: new TimeoutIDTranslation(),
    };
}
