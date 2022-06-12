import { Translation } from "@alice-localization/base/Translation";
import { PrototypecheckStrings } from "../PrototypecheckLocalization";

/**
 * The Korean translation for the `prototypecheck` command.
 */
export class PrototypecheckKRTranslation extends Translation<PrototypecheckStrings> {
    override readonly translations: PrototypecheckStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        selfInfoNotAvailable:
            "죄송해요, 당신의 프로토타입 dpp 정보는 이용할 수 없어요!",
        userInfoNotAvailable:
            "죄송해요, 그 유저의 프로토타입 dpp 정보는 이용할 수 없어요!",
        ppProfileTitle: "%s의 PP 프로필",
        totalPP: "총 PP",
        prevTotalPP: "이전 총 PP",
        diff: "차이",
        ppProfile: "PP 프로필",
        lastUpdate: "최근 업데이트",
    };
}
