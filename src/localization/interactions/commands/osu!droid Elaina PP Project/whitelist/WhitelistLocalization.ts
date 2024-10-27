import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { WhitelistENTranslation } from "./translations/WhitelistENTranslation";
import { WhitelistESTranslation } from "./translations/WhitelistESTranslation";
import { WhitelistKRTranslation } from "./translations/WhitelistKRTranslation";

export interface WhitelistStrings {
    readonly noBeatmapProvided: string;
    readonly noBeatmapIDorSetIDFound: string;
    readonly noBeatmapsFound: string;
    readonly whitelistSuccess: string;
    readonly whitelistFailed: string;
    readonly unwhitelistSuccess: string;
    readonly unwhitelistFailed: string;
    readonly noCachedBeatmapFound: string;
    readonly beatmapNotFound: string;
    readonly beatmapDoesntNeedWhitelist: string;
    readonly whitelistStatus: string;
    readonly whitelistedAndUpdated: string;
    readonly whitelistedNotUpdated: string;
    readonly notWhitelisted: string;
    readonly starRating: string; // see 63.8
    readonly filteringBeatmaps: string;
    readonly filterOptionsTitle: string;
    readonly filterOptionsDescription: string;
    readonly sortingOptionsTitle: string;
    readonly sortingOptionsDescription: string;
    readonly equalitySymbolsTitle: string;
    readonly equalitySymbolsDescription: string;
    readonly behaviorTitle: string;
    readonly behaviorDescription: string;
    readonly examplesTitle: string;
    readonly examplesDescription1: string;
    readonly examplesDescription2: string;
    readonly examplesDescription3: string;
    readonly examplesDescription4: string;
    readonly beatmapsFound: string;
    readonly beatmapLink: string;
    readonly download: string;
    readonly dateWhitelisted: string;
}

/**
 * Localizations for the `whitelist` command.
 */
export class WhitelistLocalization extends Localization<WhitelistStrings> {
    protected override readonly localizations: Readonly<
        Translations<WhitelistStrings>
    > = {
        en: new WhitelistENTranslation(),
        kr: new WhitelistKRTranslation(),
        es: new WhitelistESTranslation(),
    };
}
