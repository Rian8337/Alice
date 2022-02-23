import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TriviaStrings {
    readonly channelHasTriviaQuestionActive: string;
    readonly channelHasMapTriviaActive: string;
    readonly mapTriviaStarted: string;
    readonly couldNotRetrieveBeatmaps: string;
    readonly categoryHasNoQuestionType: string;
    readonly beatmapHint: string;
    readonly beatmapArtist: string;
    readonly beatmapTitle: string;
    readonly beatmapSource: string;
    readonly guessBeatmap: string;
    readonly outOfLives: string;
    readonly incorrectCharacterGuess: string;
    readonly correctCharacterGuess: string;
    readonly beatmapInfo: string;
    readonly beatmapCorrect: string;
    readonly beatmapIncorrect: string;
    readonly gameInfo: string;
    readonly starter: string;
    readonly timeStarted: string;
    readonly duration: string;
    readonly level: string;
    readonly leaderboard: string;
    readonly none: string;
    readonly gameEnded: string;
    readonly chooseCategory: string;
    readonly choiceRecorded: string;
    readonly correctAnswerGotten: string;
    readonly correctAnswerNotGotten: string;
    readonly oneCorrectAnswer: string;
    readonly multipleCorrectAnswers: string;
}

/**
 * Localizations for the `trivia` command.
 */
export class TriviaLocalization extends Localization<TriviaStrings> {
    protected override readonly translations: Readonly<
        Translation<TriviaStrings>
    > = {
        en: {
            channelHasTriviaQuestionActive:
                "Hey, this channel has an active trivia question! Please answer that one first!",
            channelHasMapTriviaActive:
                "Hey, this channel has an active map trivia! Please play that one!",
            mapTriviaStarted: "Game started!",
            couldNotRetrieveBeatmaps:
                "I'm sorry, I'm unable to retrieve a beatmap, therefore the game has been ended!",
            categoryHasNoQuestionType:
                "I'm sorry, the selected question category (%s) does not have any question of the type that you have requested!",
            beatmapHint: "Beatmap Hint",
            beatmapArtist: "Artist",
            beatmapTitle: "Title",
            beatmapSource: "Source",
            guessBeatmap: "Guess the beatmap!",
            outOfLives: "I'm sorry, you have run out of lives to guess!",
            incorrectCharacterGuess:
                "%s has guessed an incorrect character (%s)! They have %s live(s) left.",
            correctCharacterGuess: "%s has guessed a correct character (%s)!",
            beatmapInfo: "Beatmap Information",
            beatmapCorrect:
                "Everyone got the beatmap correct (it took %s seconds)!",
            beatmapIncorrect: "No one guessed the beatmap!",
            gameInfo: "Game Information",
            starter: "Starter",
            timeStarted: "Time started",
            duration: "Duration",
            level: "Level",
            leaderboard: "Leaderboard",
            none: "None",
            gameEnded: "Game ended!",
            chooseCategory: "Choose the category that you want to enforce.",
            choiceRecorded: "Your latest choice (%s) has been recorded!",
            correctAnswerGotten: "Hey, someone got that correctly.",
            correctAnswerNotGotten: "Looks like no one got that right.",
            oneCorrectAnswer: "The correct answer is",
            multipleCorrectAnswers: "Correct answers are",
        },
        kr: {
            channelHasTriviaQuestionActive:
                "저기, 이 채널은 이미 진행중인 트리비아 질문이 있어요! 그것부터 답해주세요!",
            channelHasMapTriviaActive:
                "저기, 이 채널은 이미 진행중인 맵 트리비아가 있어요! 그걸 플레이해 주세요!",
            mapTriviaStarted: "게임 시작!",
            couldNotRetrieveBeatmaps:
                "죄송해요, 비트맵을 검색할 수 없었어요.. 그래서 게임이 종료됐어요.",
            categoryHasNoQuestionType:
                "죄송해요, 선택된 질문 카테고리(%s)에 요청하신 유형의 질문이 없어요!",
            beatmapHint: "",
            beatmapArtist: "",
            beatmapTitle: "",
            beatmapSource: "",
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
            correctAnswerGotten: "",
            correctAnswerNotGotten: "",
            oneCorrectAnswer: "",
            multipleCorrectAnswers: "",
        },
        id: {
            channelHasTriviaQuestionActive: "",
            channelHasMapTriviaActive: "",
            mapTriviaStarted: "",
            couldNotRetrieveBeatmaps: "",
            categoryHasNoQuestionType: "",
            beatmapHint: "",
            beatmapArtist: "",
            beatmapTitle: "",
            beatmapSource: "",
            guessBeatmap: "",
            outOfLives: "",
            incorrectCharacterGuess: "",
            correctCharacterGuess: "",
            beatmapInfo: "",
            beatmapCorrect: "",
            beatmapIncorrect: "",
            gameInfo: "",
            starter: "",
            timeStarted: "",
            duration: "",
            level: "",
            leaderboard: "",
            none: "",
            gameEnded: "",
            chooseCategory: "",
            choiceRecorded: "",
            correctAnswerGotten: "",
            correctAnswerNotGotten: "",
            oneCorrectAnswer: "",
            multipleCorrectAnswers: "",
        },
    };
}
