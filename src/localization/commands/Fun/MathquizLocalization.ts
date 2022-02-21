import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MathquizStrings {
    readonly userStillHasActiveGame: "Hey, you still have an equation to solve! Please solve that one first before creating another equation!";
    readonly equationGeneratorError: "I'm sorry, the equation generator had problems generating your equation, please try again!";
    readonly equationQuestion: "%s, here is your equation:\n`Operator count %s, level %s`\n```fix\n%s = ...```You have 30 seconds to solve it.";
    readonly correctAnswer: "%s, your answer is correct! It took you %ss!\n```fix\n%s = %s```";
    readonly wrongAnswer: "%s, timed out. The correct answer is:\n```fix\n%s = %s```";
    readonly operatorCount: "Operator count";
    readonly level: "Level";
}

/**
 * Localizations for the `mathquiz` command.
 */
export class MathquizLocalization extends Localization<MathquizStrings> {
    protected override readonly translations: Readonly<
        Translation<MathquizStrings>
    > = {
        en: {
            userStillHasActiveGame:
                "Hey, you still have an equation to solve! Please solve that one first before creating another equation!",
            equationGeneratorError:
                "I'm sorry, the equation generator had problems generating your equation, please try again!",
            equationQuestion:
                "%s, here is your equation:\n`Operator count %s, level %s`\n```fix\n%s = ...```You have 30 seconds to solve it.",
            correctAnswer:
                "%s, your answer is correct! It took you %ss!\n```fix\n%s = %s```",
            wrongAnswer:
                "%s, timed out. The correct answer is:\n```fix\n%s = %s```",
            operatorCount: "Operator count",
            level: "Level",
        },
    };
}
