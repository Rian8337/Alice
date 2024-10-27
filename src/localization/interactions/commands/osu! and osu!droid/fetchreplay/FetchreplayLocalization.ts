import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { FetchreplayENTranslation } from "./translations/FetchreplayENTranslation";
import { FetchreplayESTranslation } from "./translations/FetchreplayESTranslation";
import { FetchreplayKRTranslation } from "./translations/FetchreplayKRTranslation";

export interface FetchreplayStrings {
    readonly beatmapNotProvided: string;
    readonly selfScoreNotFound: string;
    readonly userScoreNotFound: string;
    readonly noReplayFound: string;
    readonly fetchReplayNoBeatmapSuccessful: string;
    readonly playInfo: string;
    readonly hitErrorInfo: string;
    readonly hitErrorAvg: string;
}

/**
 * Localizations for the `fetchreplay` command.
 */
export class FetchreplayLocalization extends Localization<FetchreplayStrings> {
    protected override readonly localizations: Readonly<
        Translations<FetchreplayStrings>
    > = {
        en: new FetchreplayENTranslation(),
        kr: new FetchreplayKRTranslation(),
        es: new FetchreplayESTranslation(),
    };
}
