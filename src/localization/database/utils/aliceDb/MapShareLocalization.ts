import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MapShareStrings {
    readonly submissionNotAccepted: string;
    readonly beatmapNotFound: string;
    readonly submitterNotBinded: string;
}

/**
 * Localizations for the `MapShare
 */
export class MapShareLocalization extends Localization<MapShareStrings> {
    protected override readonly translations: Readonly<
        Translation<MapShareStrings>
    > = {
        en: {
            submissionNotAccepted: "submission is not accepted yet",
            beatmapNotFound: "beatmap not found",
            submitterNotBinded: "submitter is not binded",
        },
    };
}
