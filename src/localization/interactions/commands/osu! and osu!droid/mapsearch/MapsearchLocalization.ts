import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MapsearchENTranslation } from "./translations/MapsearchENTranslation";
import { MapsearchESTranslation } from "./translations/MapsearchESTranslation";
import { MapsearchIDTranslation } from "./translations/MapsearchIDTranslation";
import { MapsearchKRTranslation } from "./translations/MapsearchKRTranslation";

export interface MapsearchStrings {
    readonly requestFailed: string;
    readonly noBeatmapsFound: string;
    readonly serviceProvider: string;
    readonly beatmapsFound: string;
    readonly download: string; // see 63.22
    readonly lastUpdate: string; // see PrototypecheckLocalization
}

/**
 * Localizations for the `mapsearch` command.
 */
export class MapsearchLocalization extends Localization<MapsearchStrings> {
    protected override readonly localizations: Readonly<
        Translations<MapsearchStrings>
    > = {
        en: new MapsearchENTranslation(),
        kr: new MapsearchKRTranslation(),
        id: new MapsearchIDTranslation(),
        es: new MapsearchESTranslation(),
    };
}
