import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { MapShareENTranslation } from "./translations/MapShareENTranslation";
import { MapShareESTranslation } from "./translations/MapShareESTranslation";
import { MapShareIDTranslation } from "./translations/MapShareIDTranslation";
import { MapShareKRTranslation } from "./translations/MapShareKRTranslation";

export interface MapShareStrings {
    readonly submissionNotAccepted: string;
    readonly beatmapNotFound: string;
    readonly submitterNotBinded: string;
}

/**
 * Localizations for the `MapShare` database utility.
 */
export class MapShareLocalization extends Localization<MapShareStrings> {
    protected override readonly localizations: Readonly<
        Translations<MapShareStrings>
    > = {
        en: new MapShareENTranslation(),
        kr: new MapShareKRTranslation(),
        id: new MapShareIDTranslation(),
        es: new MapShareESTranslation(),
    };
}
