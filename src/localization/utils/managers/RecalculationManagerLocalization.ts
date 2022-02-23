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
    protected override readonly translations: Readonly<
        Translation<RecalculationManagerStrings>
    > = {
        en: {
            recalculationSuccessful: "%s, successfully recalculated %s.",
            recalculationFailed: "%s, recalculation for %s failed: %s.",
            userNotBinded: "user is not binded",
            userHasAskedForRecalc: "user has asked for recalculation",
            userDPPBanned: "user was DPP banned",
        },
        kr: {
            recalculationSuccessful: "%s, 성공적으로 %s를 재계산했어요.",
            recalculationFailed: "%s, %s의 재계산이 실패했어요: %s.",
            userNotBinded: "유저가 바인딩되어있지 않음",
            userHasAskedForRecalc: "유저 재계산을 요청함",
            userDPPBanned: "유저가 DPP-ban당함",
        },
        id: {
            recalculationSuccessful: "",
            recalculationFailed: "",
            userNotBinded: "",
            userHasAskedForRecalc: "",
            userDPPBanned: "",
        },
    };
}
