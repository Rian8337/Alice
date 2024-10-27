import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { LoungeLockManagerENTranslation } from "./translations/LoungeLockManagerENTranslation";
import { LoungeLockManagerESTranslation } from "./translations/LoungeLockManagerESTranslation";
import { LoungeLockManagerKRTranslation } from "./translations/LoungeLockManagerKRTranslation";

export interface LoungeLockManagerStrings {
    readonly userNotLocked: string;
    readonly lockUserNotification: string;
    readonly unlockUserNotification: string;
}

/**
 * Localizations for the `LoungeLockManager` manager utility.
 */
export class LoungeLockManagerLocalization extends Localization<LoungeLockManagerStrings> {
    protected override readonly localizations: Readonly<
        Translations<LoungeLockManagerStrings>
    > = {
        en: new LoungeLockManagerENTranslation(),
        kr: new LoungeLockManagerKRTranslation(),
        es: new LoungeLockManagerESTranslation(),
    };
}
