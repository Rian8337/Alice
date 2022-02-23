import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ChallengeStrings {
    readonly challengeNotFound: string;
    readonly challengeOngoing: string;
    readonly challengeNotOngoing: string;
    readonly challengeNotExpired: string;
    readonly challengeEndSuccess: string;
    readonly firstPlace: string;
    readonly constrainNotFulfilled: string;
    readonly eznfhtUsage: string;
    readonly replayNotFound: string;
    readonly customARSpeedMulUsage: string;
    readonly beatmapNotFound: string;
    readonly passReqNotFulfilled: string;
    readonly cannotParseReplay: string;
    readonly level: string;
    readonly scoreV1: string;
    readonly accuracy: string;
    readonly scoreV2: string;
    readonly missCount: string;
    readonly combo: string;
    readonly rank: string;
    readonly mods: string;
    readonly droidPP: string;
    readonly pcPP: string;
    readonly min300: string;
    readonly max100: string;
    readonly max50: string;
    readonly maxUR: string;
    readonly scoreV1Description: string;
    readonly accuracyDescription: string;
    readonly scoreV2Description: string;
    readonly noMisses: string;
    readonly missCountDescription: string;
    readonly modsDescription: string;
    readonly comboDescription: string;
    readonly rankDescription: string;
    readonly droidPPDescription: string;
    readonly pcPPDescription: string;
    readonly min300Description: string;
    readonly max100Description: string;
    readonly max50Description: string;
    readonly maxURDescription: string;
}

/**
 * Localizations for the `Challenge` database utility.
 */
export class ChallengeLocalization extends Localization<ChallengeStrings> {
    protected override readonly translations: Readonly<
        Translation<ChallengeStrings>
    > = {
        en: {
            challengeNotFound: "challenge is not scheduled",
            challengeOngoing: "a challenge is still ongoing",
            challengeNotOngoing: "challenge is not ongoing",
            challengeNotExpired: "not the time to end challenge yet",
            challengeEndSuccess: "Successfully ended challenge `%s`.",
            firstPlace:
                "Congratulations to %s for achieving first place in challenge %s, earning them %s points and %s%s Alice coins!",
            constrainNotFulfilled: "constrain not fulfilled",
            eznfhtUsage: "usage of EZ, NF, or HT",
            replayNotFound: "replay not found",
            customARSpeedMulUsage:
                "custom speed multiplier and/or force AR is used",
            beatmapNotFound: "beatmap not found",
            passReqNotFulfilled: "pass requirement is not fulfilled",
            cannotParseReplay: "cannot parse replay",
            level: "Level",
            scoreV1: "ScoreV1",
            accuracy: "Accuracy",
            scoreV2: "ScoreV2",
            missCount: "Miss Count",
            combo: "Combo",
            rank: "Rank",
            mods: "Mods",
            droidPP: "Droid PP",
            pcPP: "PC PP",
            min300: "Minimum 300",
            max100: "Maximum 100",
            max50: "Maximum 50",
            maxUR: "Maximum unstable rate",
            scoreV1Description: "Score V1 at least %s",
            accuracyDescription: "Accuracy at least %s%",
            scoreV2Description: "Score V2 at least %s",
            noMisses: "No misses",
            missCountDescription: "Miss count below %s",
            modsDescription: "Usage of %s mod only",
            comboDescription: "Combo at least %s",
            rankDescription: "%s rank or above",
            droidPPDescription: "%s dpp or more",
            pcPPDescription: "%s pp or more",
            min300Description: "300 hit result at least %s",
            max100Description: "100 hit result less than or equal to %s",
            max50Description: "50 hit result less than or equal to %s",
            maxURDescription: "UR (unstable rate) below or equal to %s",
        },
        kr: {
            challengeNotFound: "챌린지가 예정되지 않음",
            challengeOngoing: "챌린지가 아직 진행중임",
            challengeNotOngoing: "챌린지가 진행중이지 않음",
            challengeNotExpired: "아직 챌린지를 끝낼 시간이 아님",
            challengeEndSuccess: "성공적으로 챌린지 `%s`를 종료했어요.",
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
        },
        id: {
            challengeNotFound: "",
            challengeOngoing: "",
            challengeNotOngoing: "",
            challengeNotExpired: "",
            challengeEndSuccess: "",
            firstPlace: "",
            constrainNotFulfilled: "",
            eznfhtUsage: "",
            replayNotFound: "",
            customARSpeedMulUsage: "",
            beatmapNotFound: "",
            passReqNotFulfilled: "",
            cannotParseReplay: "",
            level: "",
            scoreV1: "",
            accuracy: "",
            scoreV2: "",
            missCount: "",
            combo: "",
            rank: "",
            mods: "",
            droidPP: "",
            pcPP: "",
            min300: "",
            max100: "",
            max50: "",
            maxUR: "",
            scoreV1Description: "",
            accuracyDescription: "",
            scoreV2Description: "",
            noMisses: "",
            missCountDescription: "",
            modsDescription: "",
            comboDescription: "",
            rankDescription: "",
            droidPPDescription: "",
            pcPPDescription: "",
            min300Description: "",
            max100Description: "",
            max50Description: "",
            maxURDescription: "",
        },
    };
}
