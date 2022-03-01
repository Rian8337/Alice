import { Translation } from "@alice-localization/base/Translation";
import { TriviaStrings } from "../TriviaLocalization";

/**
 * The Korean translation for the `trivia` command.
 */
export class TriviaKRTranslation extends Translation<TriviaStrings> {
    override readonly translations: TriviaStrings = {
        channelHasTriviaQuestionActive:
            "저기, 이 채널은 이미 진행중인 트리비아 질문이 있어요! 그것부터 답해주세요!",
        channelHasMapTriviaActive:
            "저기, 이 채널은 이미 진행중인 맵 트리비아가 있어요! 그걸 플레이해 주세요!",
        mapTriviaStarted: "게임 시작!",
        couldNotRetrieveBeatmaps:
            "죄송해요, 비트맵을 검색할 수 없었어요.. 그래서 게임이 종료됐어요.",
        categoryHasNoQuestionType:
            "죄송해요, 선택된 질문 카테고리(%s)에 요청하신 유형의 질문이 없어요!",
        beatmapHint: "비트맵",
        beatmapArtist: "아티스트",
        beatmapTitle: "제목",
        beatmapSource: "Source",
        guessBeatmap: "",
        outOfLives: "죄송하지만, 추측에 사용할 라이프가 다 떨어지셨어요!",
        incorrectCharacterGuess:
            "%s가 잘못된 문자(%s)를 추측했어요! 라이프가 %s개 남았어요.",
        correctCharacterGuess: "%s가 알맞은 문자(%s)를 추측했어요!",
        beatmapInfo: "비트맵 정보",
        beatmapCorrect: "모두가 비트맵을 맞췄어요 (%s초 걸렸어요)!",
        beatmapIncorrect: "아무도 비트맵을 맞추지 못했어요!",
        gameInfo: "게임 정보",
        starter: "시작자 (게임을 시작한 사람)",
        timeStarted: "시작한 시간",
        duration: "플레이 시간",
        level: "레벨",
        leaderboard: "리더보드",
        none: "없음",
        gameEnded: "게임 종료!",
        chooseCategory: "강제하고자 하는 카테고리를 선택하세요.",
        choiceRecorded: "당신의 가장 최근 선택(%s)이 기록되었어요!",
        correctAnswerGotten: "저기, 누군가가 이미 정답을 맞췄어요.",
        correctAnswerNotGotten: "아무도 정답을 못 맞춘 것 같네요.",
        oneCorrectAnswer: "정답은.. ",
        multipleCorrectAnswers: "정답은..",
    };
}
