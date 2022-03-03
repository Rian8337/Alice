import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SelectMenuCreatorENTranslation } from "./translations/SelectMenuCreatorENTranslation";
import { SelectMenuCreatorESTranslation } from "./translations/SelectMenuCreatorESTranslation";
import { SelectMenuCreatorIDTranslation } from "./translations/SelectMenuCreatorIDTranslation";
import { SelectMenuCreatorKRTranslation } from "./translations/SelectMenuCreatorKRTranslation";

export interface SelectMenuCreatorStrings {
    readonly pleaseWait: string;
    readonly timedOut: string;
}

/**
 * Localizations for the `SelectMenuCreator` creator utility.
 */
export class SelectMenuCreatorLocalization extends Localization<SelectMenuCreatorStrings> {
    protected override readonly localizations: Readonly<
        Translations<SelectMenuCreatorStrings>
    > = {
        en: new SelectMenuCreatorENTranslation(),
        kr: new SelectMenuCreatorKRTranslation(),
        id: new SelectMenuCreatorIDTranslation(),
        es: new SelectMenuCreatorESTranslation(),
    };
}
