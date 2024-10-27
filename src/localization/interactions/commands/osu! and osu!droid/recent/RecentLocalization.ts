import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { RecentENTranslation } from "./translations/RecentENTranslation";
import { RecentESTranslation } from "./translations/RecentESTranslation";
import { RecentIDTranslation } from "./translations/RecentIDTranslation";
import { RecentKRTranslation } from "./translations/RecentKRTranslation";

export interface RecentStrings {
    readonly tooManyOptions: string;
    readonly playerNotFound: string;
    readonly playerHasNoRecentPlays: string;
    readonly playIndexOutOfBounds: string;
    readonly recentPlayDisplay: string;
}

/**
 * Localizations for the `recent` command.
 */
export class RecentLocalization extends Localization<RecentStrings> {
    protected override readonly localizations: Readonly<
        Translations<RecentStrings>
    > = {
        en: new RecentENTranslation(),
        kr: new RecentKRTranslation(),
        id: new RecentIDTranslation(),
        es: new RecentESTranslation(),
    };
}
