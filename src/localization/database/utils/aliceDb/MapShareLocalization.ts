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
        kr: {
            submissionNotAccepted: "제출이 아직 받아들여지지 않음",
            beatmapNotFound: "비트맵이 발견되지 않음",
            submitterNotBinded: "제출자가 바인딩되어있지 않음",
        },
    };
}
