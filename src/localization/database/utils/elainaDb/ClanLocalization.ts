import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ClanStrings {
    readonly clanLeaderNotFound: string;
    readonly userInCurrentClan: string;
    readonly userInAnotherClan: string;
    readonly userInCooldownForOldClan: string;
    readonly userInCooldownForClan: string;
    readonly userBindedAccountNotFound: string;
    readonly clanLeaderCannotLeaveClan: string;
    readonly userNotInClan: string;
    readonly leaderIsTheSame: string;
    readonly cannotFindNewLeader: string;
    readonly clanInMatchMode: string;
    readonly clanNotInMatchMode: string;
    readonly noClanRole: string;
    readonly invalidImage: string;
    readonly invalidImageRatio: string;
    readonly descriptionTooLong: string;
    readonly clanPowerNegativeWarning: string;
    readonly clanPowerInfiniteWarning: string;
}

/**
 * Localizations for the `Clan` database utility.
 */
export class ClanLocalization extends Localization<ClanStrings> {
    protected override readonly translations: Readonly<
        Translation<ClanStrings>
    > = {
        en: {
            clanLeaderNotFound: "clan leader not found",
            userInCurrentClan: "user is already in this clan",
            userInAnotherClan: "user is already in another clan",
            userInCooldownForOldClan:
                "user is still in cooldown to join old clan",
            userInCooldownForClan: "user is still in cooldown to join a clan",
            userBindedAccountNotFound: "user's binded accounts not found",
            clanLeaderCannotLeaveClan: "clan leader cannot leave the clan",
            userNotInClan: "user is not in the clan",
            leaderIsTheSame: "new leader is the same as the old leader",
            cannotFindNewLeader: "cannot find new leader",
            clanInMatchMode: "clan is already in match mode",
            clanNotInMatchMode: "clan is already not in match mode",
            noClanRole: "clan role doesn't exist",
            invalidImage: "invalid image",
            invalidImageRatio: "image ratio is not 18:5",
            descriptionTooLong: "description must be less than 2000 characters",
            clanPowerNegativeWarning: "clan power will fall below zero",
            clanPowerInfiniteWarning: "clan power will be infinite",
        },
        kr: {
            clanLeaderNotFound: "클랜 리더가 발견되지 않음",
            userInCurrentClan: "유저가 이미 이 클랜에 있음",
            userInAnotherClan: "유저가 이미 다른 클랜에 있음",
            userInCooldownForOldClan:
                "유저 아직 이전 클랜에 가입하기 위한 쿨다운 상태임",
            userInCooldownForClan:
                "유저 아직 클랜에 가입하기 위한 쿨다운 상태임",
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
        },
    };
}
