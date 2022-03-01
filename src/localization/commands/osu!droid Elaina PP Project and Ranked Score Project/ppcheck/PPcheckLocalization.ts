import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PPcheckENTranslation } from "./translations/PPcheckENTranslation";
import { PPcheckIDTranslation } from "./translations/PPcheckIDTranslation";
import { PPcheckKRTranslation } from "./translations/PPcheckKRTranslation";

export interface PPcheckStrings {
    readonly tooManyOptions: string;
}

/**
 * Localizations for `ppcheck` command.
 */
export class PPcheckLocalization extends Localization<PPcheckStrings> {
    protected override readonly localizations: Readonly<
        Translations<PPcheckStrings>
    > = {
        en: new PPcheckENTranslation(),
        kr: new PPcheckKRTranslation(),
        id: new PPcheckIDTranslation(),
    };
}
