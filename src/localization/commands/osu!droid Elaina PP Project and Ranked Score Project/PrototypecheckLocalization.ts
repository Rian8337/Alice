import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PrototypecheckStrings {
    readonly tooManyOptions: string;
    readonly selfInfoNotAvailable: string;
    readonly userInfoNotAvailable: string;
    readonly ppProfileTitle: string;
    readonly totalPP: string;
    readonly prevTotalPP: string;
    readonly diff: string;
    readonly ppProfile: string;
    readonly lastUpdate: string;
}

/**
 * Localizations for the `prototypecheck` command.
 */
export class PrototypecheckLocalization extends Localization<PrototypecheckStrings> {
    protected override readonly translations: Readonly<
        Translation<PrototypecheckStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            selfInfoNotAvailable:
                "I'm sorry, your prototype dpp information is not available!",
            userInfoNotAvailable:
                "I'm sorry, the user's prototype dpp information is not available!",
            ppProfileTitle: "PP Profile for %s",
            totalPP: "Total PP",
            prevTotalPP: "Previous Total PP",
            diff: "Difference",
            ppProfile: "PP Profile",
            lastUpdate: "Last Update",
        },
        kr: {
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
        },
    };
}
