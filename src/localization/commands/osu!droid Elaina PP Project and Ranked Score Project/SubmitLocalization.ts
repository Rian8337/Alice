import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SubmitStrings {
    readonly commandNotAllowed: string;
    readonly uidIsBanned: string;
    readonly beatmapNotFound: string;
    readonly beatmapIsBlacklisted: string;
    readonly beatmapNotWhitelisted: string;
    readonly beatmapTooShort: string;
    readonly noScoreSubmitted: string;
    readonly noScoresInSubmittedList: string;
    readonly scoreUsesForceAR: string;
    readonly scoreUsesCustomSpeedMultiplier: string;
    readonly submitSuccessful: string;
    readonly profileNotFound: string;
    readonly totalPP: string;
    readonly ppGained: string;
    readonly rankedScore: string;
    readonly scoreGained: string;
    readonly currentLevel: string;
    readonly levelUp: string;
    readonly scoreNeeded: string;
    readonly ppSubmissionInfo: string;
    readonly blacklistedBeatmapReject: string;
    readonly unrankedBeatmapReject: string;
    readonly beatmapTooShortReject: string;
    readonly unrankedFeaturesReject: string;
    readonly beatmapNotFoundReject: string;
}

/**
 * Localizations for the `submit` command.
 */
export class SubmitLocalization extends Localization<SubmitStrings> {
    protected override readonly translations: Readonly<
        Translation<SubmitStrings>
    > = {
        en: {
            commandNotAllowed:
                "I'm sorry, this command is not available in this channel.",
            uidIsBanned:
                "I'm sorry, your currently binded osu!droid account has been disallowed from submitting dpp.",
            beatmapNotFound: "Hey, please give me a valid beatmap to submit!",
            beatmapIsBlacklisted:
                "I'm sorry, this beatmap has been blacklisted.",
            beatmapNotWhitelisted:
                "I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved beatmaps right now!",
            beatmapTooShort:
                "I'm sorry, this beatmap is either too short (less than 30 seconds) or doesn't have at least 60% of its music length mapped.",
            noScoreSubmitted:
                "I'm sorry, you don't have a score submitted in this beatmap!",
            noScoresInSubmittedList:
                "I'm sorry, you don't have any scores to submit within that range and offset!",
            scoreUsesForceAR: "I'm sorry, force AR is not allowed!",
            scoreUsesCustomSpeedMultiplier:
                "I'm sorry, custom speed multiplier is not allowed!",
            submitSuccessful:
                "Successfully submitted your play(s). More info in embed.",
            profileNotFound: "I'm sorry, I cannot find your profile!",
            totalPP: "Total PP",
            ppGained: "PP gained",
            rankedScore: "Ranked score",
            scoreGained: "Score gained",
            currentLevel: "Current level",
            levelUp: "Level up!",
            scoreNeeded: "Score needed to level up",
            ppSubmissionInfo: "PP submission info",
            blacklistedBeatmapReject: "Blacklisted beatmap",
            unrankedBeatmapReject: "Unranked beatmap",
            beatmapTooShortReject: "Beatmap too short",
            unrankedFeaturesReject: "Unranked features",
            beatmapNotFoundReject: "Beatmap not found",
        },
        kr: {
            commandNotAllowed:
                "죄송해요, 이 명령어는 이 채널에서 사용할 수 없어요.",
            uidIsBanned:
                "죄송해요, 현재 당신이 바인딩된 osu!droid 계정은 dpp-ban을 당했어요.",
            beatmapNotFound: "저기, 제출할 유효한 비트맵을 주세요!",
            beatmapIsBlacklisted: "죄송해요, 이 비트맵은 블랙리스트에 있어요.",
            beatmapNotWhitelisted:
                "죄송해요, 현재 PP 시스템은 오직 ranked, approved, loved 상태 또는 화이트리스트된 비트맵만 받고 있어요!",
            beatmapTooShort:
                "죄송해요, 이 비트맵은 너무 짧거나(30초 미만) 매핑된 부분이 음악 길이의 60% 미만이에요.",
            noScoreSubmitted:
                "죄송해요, 당신은 이 비트맵에 제출한 기록이 없어요!",
            noScoresInSubmittedList:
                "죄송해요, 당신은 해당 범위에서 제출할 기록을 가지고 있지 않아요!",
            scoreUsesForceAR: "죄송해요, AR 강제(force AR)은 허용되지 않아요!",
            scoreUsesCustomSpeedMultiplier:
                "죄송해요, 커스텀 속도 조절(custom speed multiplier)은 허용되지 않아요!",
            submitSuccessful:
                "성공적으로 기록을 제출했어요. 더 많은 정보는 첨부해 드렸어요.",
            profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
            totalPP: "총 PP",
            ppGained: "얻은 PP",
            rankedScore: "Ranked 점수",
            scoreGained: "얻은 점수",
            currentLevel: "현재 레벨",
            levelUp: "레벨 업!",
            scoreNeeded: "레벨 업에 필요한 점수",
            ppSubmissionInfo: "PP 제출 정보",
            blacklistedBeatmapReject: "블랙리스트된 비트맵",
            unrankedBeatmapReject: "언랭크드(Unranked) 비트맵",
            beatmapTooShortReject: "비트맵 너무 짧음",
            unrankedFeaturesReject: "Unranked 기능",
            beatmapNotFoundReject: "비트맵 발견되지 않음",
        },
    };
}
