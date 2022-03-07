import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ManualTimeoutCheckENTranslation } from "./translations/ManualTimeoutCheckENTranslation";
import { ManualTimeoutCheckESTranslation } from "./translations/ManualTimeoutCheckESTranslation";
import { ManualTimeoutCheckIDTranslation } from "./translations/ManualTimeoutCheckIDTranslation";
import { ManualTimeoutCheckKRTranslation } from "./translations/ManualTimeoutCheckKRTranslation";

export interface ManualTimeoutCheckStrings {
    readonly notSpecified: string;
    readonly timeoutExecuted: string;
    readonly untimeoutExecuted: string;
    readonly inChannel: string;
    readonly reason: string;
    readonly userId: string; // see 30.34
    readonly channelId: string;
    readonly timeoutUserNotification: string;
    readonly untimeoutUserNotification: string;
}

/**
 * Localizations for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckLocalization extends Localization<ManualTimeoutCheckStrings> {
    protected override readonly localizations: Readonly<
        Translations<ManualTimeoutCheckStrings>
    > = {
        en: new ManualTimeoutCheckENTranslation(),
        kr: new ManualTimeoutCheckKRTranslation(),
        id: new ManualTimeoutCheckIDTranslation(),
        es: new ManualTimeoutCheckESTranslation(),
    };
}
