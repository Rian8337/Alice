import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RecalculationManagerStrings {
    readonly recalculationSuccessful: string;
    readonly recalculationFailed: string;
    readonly userNotBinded: string;
    readonly userHasAskedForRecalc: string;
    readonly userDPPBanned: string;
}

/**
 * Localizations for the `RecalculationManager` manager utility.
 */
export class RecalculationManagerLocalization extends Localization<RecalculationManagerStrings> {
    protected override readonly translations: Readonly<Translation<RecalculationManagerStrings>> = {
        en: {
            recalculationSuccessful: "%s, successfully recalculated %s.",
            recalculationFailed: "%s, recalculation for %s failed: %s.",
            userNotBinded: "user is not binded",
            userHasAskedForRecalc: "user has asked for recalculation",
            userDPPBanned: "user was DPP banned",
        }
    };
}