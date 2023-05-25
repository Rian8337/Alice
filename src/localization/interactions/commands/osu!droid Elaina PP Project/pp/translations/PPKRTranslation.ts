import { Translation } from "@alice-localization/base/Translation";
import { PPStrings } from "../PPLocalization";

/**
 * The Korean translation for the `ppcheck` command.
 */
export class PPKRTranslation extends Translation<PPStrings> {
    override readonly translations: PPStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
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
        selfInfoNotAvailable:
            "죄송해요, 당신의 프로토타입 dpp 정보는 이용할 수 없어요!",
        userInfoNotAvailable:
            "죄송해요, 그 유저의 프로토타입 dpp 정보는 이용할 수 없어요!",
        ppProfileTitle: "%s의 PP 프로필",
        prevTotalPP: "이전 총 PP",
        diff: "차이",
        ppProfile: "PP 프로필",
        lastUpdate: "최근 업데이트",
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
        noScoreSubmitted: "죄송해요, 당신은 이 비트맵에 제출한 기록이 없어요!",
        noScoresInSubmittedList:
            "죄송해요, 당신은 해당 범위에서 제출할 기록을 가지고 있지 않아요!",
        submitFailed: "",
        partialSubmitSuccessful: "",
        fullSubmitSuccessful: "성공적으로 기록을 제출했어요.",
        profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        ppSubmissionInfo: "PP 제출 정보",
        whatIfScoreNotEntered: "",
        whatIfScoreEntered: "",
    };
}
