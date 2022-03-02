import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CalculateENTranslation } from "./translations/CalculateENTranslation";
import { CalculateESTranslation } from "./translations/CalculateESTranslation";
import { CalculateIDTranslation } from "./translations/CalculateIDTranslation";
import { CalculateKRTranslation } from "./translations/CalculateKRTranslation";

export interface CalculateStrings {
    readonly noBeatmapProvided: string;
    readonly beatmapProvidedIsInvalid: string;
    readonly beatmapNotFound: string;
    readonly rawDroidSr: string;
    readonly rawDroidPp: string;
    readonly rawPcSr: string;
    readonly rawPcPp: string;
}

/**
 * Localizations for the `calculate` command.
 */
export class CalculateLocalization extends Localization<CalculateStrings> {
    protected override readonly localizations: Readonly<
        Translations<CalculateStrings>
    > = {
        en: new CalculateENTranslation(),
        kr: new CalculateKRTranslation(),
        id: new CalculateIDTranslation(),
        es: new CalculateESTranslation(),
    };
}
