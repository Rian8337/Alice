import { Translation } from "@localization/base/Translation";
import { ClanStrings } from "../ClanLocalization";

/**
 * The Korean translation for the `Clan` database utility.
 */
export class ClanKRTranslation extends Translation<ClanStrings> {
    override readonly translations: ClanStrings = {
        clanLeaderNotFound: "클랜 리더가 발견되지 않음",
        userInCurrentClan: "유저가 이미 이 클랜에 있음",
        userInAnotherClan: "유저가 이미 다른 클랜에 있음",
        userInCooldownForOldClan:
            "유저 아직 이전 클랜에 가입하기 위한 쿨다운 상태임",
        userInCooldownForClan: "유저 아직 클랜에 가입하기 위한 쿨다운 상태임",
        userBindedAccountNotFound: "유저의 바인딩된 계정이 발견되지 않음",
        clanLeaderCannotLeaveClan: "클랜 리더는 클랜을 떠날 수 없음",
        userNotInClan: "유저가 클랜에 없음",
        leaderIsTheSame: "새 리더가 이전 리더와 같음",
        cannotFindNewLeader: "새 리더를 찾을 수 없음",
        clanInMatchMode: "클랜이 이미 매치모드임",
        clanNotInMatchMode: "클랜이 이미 매치모드가 아님",
        noClanRole: "클랜 역할이 존재하지 않음",
        invalidImage: "유효하지 않은 이미지",
        invalidImageRatio: "이미지 비율이 18:5가 아님",
        descriptionTooLong: "설명은 2000자 미만이여야함",
        clanPowerNegativeWarning: "클랜 파워가 0 미만으로 떨어짐",
        clanPowerInfiniteWarning: "클랜 파워가 무한대가 됨",
    };
}
