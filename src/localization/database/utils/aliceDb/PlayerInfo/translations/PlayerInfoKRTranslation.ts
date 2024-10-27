import { Translation } from "@localization/base/Translation";
import { PlayerInfoStrings } from "../PlayerInfoLocalization";

/**
 * The Korean translation for the `PlayerInfo` database utility.
 */
export class PlayerInfoKRTranslation extends Translation<PlayerInfoStrings> {
    override readonly translations: PlayerInfoStrings = {
        tooMuchCoinDeduction:
            "너무 많은 코인 감소량. 최대 %s 앨리스 코인 감소 가능",
        dailyClaimUsed: "데일리 코인 수령을 이미 사용함",
        dailyLimitReached:
            "전달한 양이 일일 최대치를 넘음 - 오늘 %s 앨리스 코인을 더 전달 가능.",
    };
}
