import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { BlacklistENTranslation } from "./translations/BlacklistENTranslation";
import { BlacklistESTranslation } from "./translations/BlacklistESTranslation";
import { BlacklistIDTranslation } from "./translations/BlacklistIDTranslation";
import { BlacklistKRTranslation } from "./translations/BlacklistKRTranslation";

export interface BlacklistStrings {
    readonly noBeatmapProvided: string;
    readonly beatmapNotFound: string;
    readonly noBlacklistReasonProvided: string;
    readonly blacklistFailed: string;
    readonly blacklistSuccess: string;
    readonly unblacklistFailed: string;
    readonly unblacklistSuccess: string;
    readonly detectedBeatmapId: string;
    readonly blacklist: string;
    readonly blacklistAction: string;
    readonly unblacklist: string;
    readonly unblacklistAction: string;
}

/**
 * Localizations for the `blacklist` command.
 */
export class BlacklistLocalization extends Localization<BlacklistStrings> {
    protected override readonly localizations: Readonly<
        Translations<BlacklistStrings>
    > = {
        en: new BlacklistENTranslation(),
        kr: new BlacklistKRTranslation(),
        id: new BlacklistIDTranslation(),
        es: new BlacklistESTranslation(),
    };
}
