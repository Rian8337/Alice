import { Translation } from "@localization/base/Translation";
import { GamestatsStrings } from "../GamestatsLocalization";

/**
 * The Korean translation for the `gamestats` command.
 */
export class GamestatsKRTranslation extends Translation<GamestatsStrings> {
    override readonly translations: GamestatsStrings = {
        cannotRetrieveGameStatistics:
            "죄송해요, 게임 통계를 가져올 수 없었어요!",
        overallGameStats: "종합 게임 통계",
        registeredAccounts: "가입된 계정",
        totalRegisteredAccounts: "총 계정 수",
        moreThan5ScoresAcc: "기록 5개 이상",
        moreThan20ScoresAcc: "기록 20개 이상",
        moreThan100ScoresAcc: "기록 100개 이상",
        moreThan200ScoresAcc: "기록 200개 이상",
        totalScores: "총 온라인 기록 수",
    };
}
