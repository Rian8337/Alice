import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { RecalcENTranslation } from "./translations/RecalcENTranslation";
import { RecalcESTranslation } from "./translations/RecalcESTranslation";
import { RecalcKRTranslation } from "./translations/RecalcKRTranslation";

export interface RecalcStrings {
    readonly tooManyOptions: string;
    readonly userIsDPPBanned: string;
    readonly userHasRequestedRecalc: string;
    readonly userQueued: string;
    readonly fullRecalcInProgress: string;
    readonly fullRecalcTrackProgress: string;
    readonly fullRecalcSuccess: string;
}

/**
 * Localizations for the `recalc` command.
 */
export class RecalcLocalization extends Localization<RecalcStrings> {
    protected override readonly localizations: Readonly<
        Translations<RecalcStrings>
    > = {
        en: new RecalcENTranslation(),
        kr: new RecalcKRTranslation(),
        es: new RecalcESTranslation(),
    };
}
