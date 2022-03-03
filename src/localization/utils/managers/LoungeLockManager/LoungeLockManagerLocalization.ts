import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { LoungeLockManagerENTranslation } from "./translations/LoungeLockManagerENTranslation";
import { LoungeLockManagerESTranslation } from "./translations/LoungeLockManagerESTranslation";
import { LoungeLockManagerIDTranslation } from "./translations/LoungeLockManagerIDTranslation";
import { LoungeLockManagerKRTranslation } from "./translations/LoungeLockManagerKRTranslation";

export interface LoungeLockManagerStrings {
    readonly userNotLocked: string;
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
        id: new LoungeLockManagerIDTranslation(),
        es: new LoungeLockManagerESTranslation(),
    };
}
