import { Translation } from "@alice-localization/base/Translation";
import { PoolStrings } from "../PoolLocalization";

/**
 * The Korean translation for the `pool` command.
 */
export class PoolKRTranslation extends Translation<PoolStrings> {
    override readonly translations: PoolStrings = {
        poolNotFound: "죄송해요, 찾으시는 맵풀을 찾을 수 없었어요!",
        length: "길이",
        maxScore: "",
        mapNotFound: "",
        beatmapHasNoScores: "죄송해요, 이 비트맵엔 제출된 기록이 없네요!",
        topScore: "1등 기록",
    };
}
