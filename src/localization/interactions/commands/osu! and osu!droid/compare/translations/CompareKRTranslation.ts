import { Translation } from "@localization/base/Translation";
import { CompareStrings } from "../CompareLocalization";

/**
 * The Korean translation for the `compare` command.
 */
export class CompareKRTranslation extends Translation<CompareStrings> {
    override readonly translations: CompareStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        noCachedBeatmap: "죄송해요, 이 채널에서 얘기중인 비트맵이 없네요!",
        playerNotFound: "죄송해요, 찾으시려는 플레이어를 못찾겠어요!",
        selfScoreNotFound:
            "죄송해요, 이 비트맵에 아무런 기록도 남기지 않으셨네요!",
        userScoreNotFound:
            "죄송해요, 이 유저는 해당 비트맵에 아무런 기록도 남기지 않았네요!",
        comparePlayDisplay: "%s의 플레이 비교:",
    };
}
