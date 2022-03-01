import { Translation } from "@alice-localization/base/Translation";
import { PPcompareStrings } from "../PPcompareLocalization";

/**
 * The Korean translation for the `ppcompare` command.
 */
export class PPcompareKRTranslation extends Translation<PPcompareStrings> {
    override readonly translations: PPcompareStrings = {
        cannotCompareSamePlayers: "",
        playerNotBinded: '죄송해요, %s "%s"은(는) 바인딩 되어있지 않아요!',
        uid: "uid",
        username: "유저",
        user: "유저네임",
        noSimilarPlayFound:
            "죄송해요, 두 플레이어가 겹치는 최고 성과(Top play)가 없네요!",
        topPlaysComparison: "Top PP 기록 비교",
        player: "플레이어",
        totalPP: "총 PP",
    };
}
