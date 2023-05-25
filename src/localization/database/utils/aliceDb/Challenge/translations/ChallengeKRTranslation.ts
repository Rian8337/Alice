import { Translation } from "@alice-localization/base/Translation";
import { ChallengeStrings } from "../ChallengeLocalization";

/**
 * The Korean translation for the `Challenge` database utility.
 */
export class ChallengeKRTranslation extends Translation<ChallengeStrings> {
    override readonly translations: ChallengeStrings = {
        challengeNotFound: "챌린지가 예정되지 않음",
        challengeOngoing: "챌린지가 아직 진행중임",
        challengeNotOngoing: "챌린지가 진행중이지 않음",
        challengeNotExpired: "아직 챌린지를 끝낼 시간이 아님",
        challengeEndSuccess: "성공적으로 챌린지 `%s`를 종료했어요.",
        challengeEmbedGenerationFailed: "",
        firstPlace:
            "%s님, 챌린지 %s에서 1등을 차지한 걸 축하드려요! 보상으로 %s 포인트와 %s%s 앨리스 코인을 드렸어요!",
        constrainNotFulfilled: "조건이 충족되지 않음",
        eznfhtUsage: "EZ, NF, 또는 HT의 사용",
        replayNotFound: "리플레이 발견되지 않음",
        customARSpeedMulUsage:
            "커스텀 속도 조작(custom speed multiplier)이나 AR 강제(force AR)가 사용됨",
        beatmapNotFound: "비트맵 발견되지 않음",
        passReqNotFulfilled: "패스 조건이 충족되지 않음",
        cannotParseReplay: "리플레이를 가져올 수 없음",
        level: "레벨",
        scoreV1: "ScoreV1",
        accuracy: "정확도",
        scoreV2: "ScoreV2",
        missCount: "미스 수",
        combo: "콤보",
        rank: "랭크",
        mods: "모드",
        droidPP: "Droid PP",
        pcPP: "PC PP",
        min300: "최소 300",
        max100: "최대 100",
        max50: "최대 50",
        maxUR: "최대 ur(unstable rate)",
        scoreV1Description: "Score V1 최소 %s점",
        accuracyDescription: "필요 최소 정확도 %s",
        scoreV2Description: "Score V2 최소 %s점",
        noMisses: "미스 없음",
        missCountDescription: "미스 수 %s 미만",
        modsDescription: "%s 모드만 사용",
        comboDescription: "%s 콤보 이상",
        rankDescription: "%s 랭크 이상",
        droidPPDescription: "%s dpp이상",
        pcPPDescription: "%s pp이상",
        min300Description: "300 타격 횟수 %s 이상",
        max100Description: "100 타격 횟수 %s 이하",
        max50Description: "50 타격 횟수 %s 이하",
        maxURDescription: "UR (unstable rate)%s 이하",
    };
}
