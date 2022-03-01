import { Translation } from "@alice-localization/base/Translation";
import { MathgameStrings } from "../MathgameLocalization";

/**
 * The Korean translation for the `mathgame` command.
 */
export class MathgameKRTranslation extends Translation<MathgameStrings> {
    override readonly translations: MathgameStrings = {
        userHasOngoingGame:
            "저기, 진행중인 게임이 있어요! 그것부터 플레이해 주세요!",
        channelHasOngoingGame:
            "저기, 이 채널에서 진행중인 게임이 있어요! 그것부터 플레이해 주세요!",
        gameStartedNotification: "게임 시작!",
        couldNotFetchEquationGameEnd:
            "안타깝게도, 식 생성기가 %s회의 시도를 했지만 어느 식도 만들어내지 못했어요! 그래서 게임이 끝났어요!",
        noAnswerGameEnd:
            "안타깝게도, 식 생성기가 %s회의 시도를 했지만 어느 식도 만들어내지 못했어요! 그래서 게임이 끝났어요!",
        singleGamemodeQuestion:
            "%s, 이 방정식을 30초 내에 풀어 보세요!\n`연산자 %s개, 레벨 %s`\n```fix\n%s = ...```",
        multiGamemodeQuestion:
            "이 문제를 30초 내에 풀어보세요(레벨 %s, 연산자 %s개)!\n```fix\n%s = ...```",
        correctAnswer: "%s가 정답을 맞췄습니다! %s초 걸렸네요.",
        gameStatistics: "",
        gameStarter: "게임 시작자",
        timeStarted: "시작한 시간",
        duration: "플레이 시간",
        levelReached: "도달한 레벨",
        operatorCount: "맞춘 총 정답 수",
        level: "레벨",
        totalCorrectAnswers: "맞춘 총 정답 수",
        answers: "",
    };
}
