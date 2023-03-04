import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SimulateENTranslation } from "./translations/SimulateENTranslation";
import { SimulateESTranslation } from "./translations/SimulateESTranslation";
import { SimulateIDTranslation } from "./translations/SImulateIDTranslation";
import { SimulateKRTranslation } from "./translations/SImulateKRTranslation";

export interface SimulateStrings {
    readonly noSimulateOptions: string;
    readonly tooManyOptions: string;
    readonly playerNotFound: string;
    readonly playerHasNoRecentPlays: string;
    readonly noBeatmapProvided: string;
    readonly beatmapProvidedIsInvalid: string;
    readonly beatmapNotFound: string;
    readonly selfScoreNotFound: string;
    readonly userScoreNotFound: string;
    readonly simulatedPlayDisplay: string;
}

/**
 * Localizations for the `simulate` command.
 */
export class SimulateLocalization extends Localization<SimulateStrings> {
    protected override readonly localizations: Readonly<
        Translations<SimulateStrings>
    > = {
        en: new SimulateENTranslation(),
        es: new SimulateESTranslation(),
        id: new SimulateIDTranslation(),
        kr: new SimulateKRTranslation(),
    };
}
