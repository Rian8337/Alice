import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PlayerInfoStrings {
    readonly tooMuchCoinDeduction: string;
    readonly dailyClaimUsed: string;
    readonly dailyLimitReached: string;
}

/**
 * Localizations for the `PlayerInfo` database utility.
 */
export class PlayerInfoLocalization extends Localization<PlayerInfoStrings> {
    protected override readonly translations: Readonly<
        Translation<PlayerInfoStrings>
    > = {
        en: {
            tooMuchCoinDeduction:
                "too much coin deduction; can only deduct at most %s Alice coins",
            dailyClaimUsed: "daily claim has been used",
            dailyLimitReached:
                "transferred amount is beyond daily limit—can only transfer %s Alice coins left.",
        },
        kr: {
            tooMuchCoinDeduction:
                "너무 많은 코인 감소량. 최대 %s 앨리스 코인 감소 가능",
            dailyClaimUsed: "데일리 코인 수령을 이미 사용함",
            dailyLimitReached:
                "전달한 양이 일일 최대치를 넘음 - 오늘 %s 앨리스 코인을 더 전달 가능.",
        },
        id: {
            tooMuchCoinDeduction: "",
            dailyClaimUsed: "",
            dailyLimitReached: "",
        },
    };
}
