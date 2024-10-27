import { Translation } from "@localization/base/Translation";
import { MathquizStrings } from "../MathquizLocalization";

/**
 * The Korean translation for the `mathquiz` command.
 */
export class MathquizKRTranslation extends Translation<MathquizStrings> {
    override readonly translations: MathquizStrings = {
        userStillHasActiveGame:
            "저기, 아직 풀어야할 문제가 남아있어요! 다른 문제를 만들기 전에 그것부터 풀어주세요!",
        equationGeneratorError:
            "죄송해요, 식을 생성하는 데 문제가 있었어요. 잠시 후 다시 시도해 주세요!",
        equationQuestion:
            "%s, 여기 문제에요:\n`연산자 개수 %s, 레벨 %s`\n```fix\n%s = ...```문제를 30초 안에 풀어야 해요.",
        correctAnswer: "%s, 정답이에요! %s초 걸렸어요!",
        wrongAnswer: "%s, 시간이 다 됐어요. 정답은:\n```fix\n%s = ...```",
        operatorCount: "연산자 개수",
        level: "레벨",
    };
}
