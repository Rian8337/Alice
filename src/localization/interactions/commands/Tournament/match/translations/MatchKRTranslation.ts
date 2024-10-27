import { Translation } from "@localization/base/Translation";
import { MatchStrings } from "../MatchLocalization";

/**
 * The Korean translation for the `match` command.
 */
export class MatchKRTranslation extends Translation<MatchStrings> {
    override readonly translations: MatchStrings = {
        invalidMatchID: "저기, 매치 ID를 규칙에 맞게 지어주세요!",
        matchIDAlreadyTaken: "죄송해요, 이미 동일한 ID의 매치가 존재해요!",
        teamPlayerCountDoNotBalance:
            "죄송해요, 두 팀의 플레이어 수 차이는 1을 초과할 수 없어요!",
        invalidPlayerInformation:
            "죄송해요, 이 플레이어 정보는 올바르지 않아요: %s.",
        invalidChannelToBind:
            "저기, 매치는 텍스트 채널에서만 바인드 할 수 있어요!",
        matchDoesntExist:
            "죄송해요, 해당 매치가 존재하지 않거나 이 채널/스레드가 매치에 바인드 되어있지 않아요!",
        matchHasEnded: "죄송해요, 이 매치는 이미 종료됐어요!",
        matchHasNoResult: "죄송해요, 이 매치는 아직 아무 결과가 없어요!",
        mappoolNotFound: "죄송해요, 맵풀을 찾을 수 없었어요!",
        mapNotFound: "죄송해요, 최근에 플레이된 비트맵을 찾을 수 없었어요!",
        playerNotFound: "죄송해요, uid %s의 프로필을 찾을 수 없었어요!",
        matchDataInProcess: "매치 데이터를 가져오는중. 잠시만 기다려주세요...",
        roundInitiated: "라운드 시작!",
        roundCountdownFinished: "비트맵 시간 종료. 30초 쿨다운 시작..",
        roundEnded: "라운드 종료!",
        teamPlayerCountDoesntMatch:
            "죄송해요, 입력값이 맞지 않아요. 팀 %s은 플레이어가 %s명이에요. 당신은 %s명의 플레이어 데이터만 입력했어요.",
        scoreDataInvalid:
            "죄송해요, 팀%s의 플레이어 %s의 기록 데이터가 유효하지 않아요: %s.",
        addMatchFailed: "죄송해요, 매치를 추가할 수 없었어요: %s.",
        addMatchSuccessful: "성공적으로 매치 %s를 추가했어요.",
        bindMatchFailed: "죄송해요, 매치를 바인드할 수 없었어요: %s.",
        bindMatchSuccessful:
            "성공적으로 매치 %s를 이 채널에 바인드했어요. 스레드를 확인해 주세요.",
        endMatchFailed: "죄송해요, 매치를 종료할 수 없었어요: %s.",
        endMatchSuccessful: "성공적으로 매치 %s를 종료했어요.",
        removeMatchFailed: "죄송해요, 매치를 제거할 수 없었어요: %s.",
        removeMatchSuccessful: "성공적으로 매치 %s를 제거했어요.",
        undoMatchFailed: "죄송해요, 매치 결과를 되돌릴 수 없었어요: %s.",
        undoMatchSuccessful: "성공적으로 매치 %s의 결과를 되돌렸어요.",
        unbindMatchFailed: "죄송해요, 매치의 바인드를 해제할 수 없었어요: %s.",
        unbindMatchSuccessful: "성공적으로 매치 %s의 바인드를 해제했어요.",
        submitMatchFailed: "죄송해요, 매치 결과를 제출할 수 없었어요: %s.",
        submitMatchSuccessful: "성공적으로 매치 결과를 업데이트했어요.",
        failed: "실패",
        none: "없음",
        draw: "무승부",
        won: "%s이 %s점 차이로 승리",
        roundInfo: "라운드 정보",
        matchId: "매치 ID",
        map: "맵",
        mapLength: "맵 길이",
    };
}
