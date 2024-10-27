import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ConstantsENTranslation } from "./translations/ConstantsENTranslation";
import { ConstantsESTranslation } from "./translations/ConstantsESTranslation";
import { ConstantsIDTranslation } from "./translations/ConstantsIDTranslation";
import { ConstantsKRTranslation } from "./translations/ConstantsKRTranslation";

export interface ConstantsStrings {
    readonly noPermissionToExecuteCommand: string;
    readonly selfAccountNotBinded: string;
    readonly commandNotAvailableInServer: string;
    readonly commandNotAvailableInChannel: string;
    readonly userAccountNotBinded: string;
}

/**
 * Localizations for the `Constants` core class.
 */
export class ConstantsLocalization extends Localization<ConstantsStrings> {
    protected override readonly localizations: Readonly<
        Translations<ConstantsStrings>
    > = {
        en: new ConstantsENTranslation(),
        kr: new ConstantsKRTranslation(),
        id: new ConstantsIDTranslation(),
        es: new ConstantsESTranslation(),
    };
}
