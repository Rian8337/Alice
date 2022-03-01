import { Translation } from "@alice-localization/base/Translation";
import { MathquizStrings } from "../MathquizLocalization";

/**
 * The English translation for the `mathquiz` command.
 */
export class MathquizENTranslation extends Translation<MathquizStrings> {
    override readonly translations: MathquizStrings = {
        userStillHasActiveGame:
            "Hey, you still have an equation to solve! Please solve that one first before creating another equation!",
        equationGeneratorError:
            "I'm sorry, the equation generator had problems generating your equation, please try again!",
        equationQuestion:
            "%s, here is your equation:\n`Operator count %s, level %s`\n```fix\n%s = ...```You have 30 seconds to solve it.",
        correctAnswer:
            "%s, your answer is correct! It took you %s seconds!\n```fix\n%s = %s```",
        wrongAnswer:
            "%s, timed out. The correct answer is:\n```fix\n%s = %s```",
        operatorCount: "Operator count",
        level: "Level",
    };
}
