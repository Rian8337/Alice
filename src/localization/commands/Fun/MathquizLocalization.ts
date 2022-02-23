import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MathquizStrings {
    readonly userStillHasActiveGame: string;
    readonly equationGeneratorError: string;
    readonly equationQuestion: string;
    readonly correctAnswer: string;
    readonly wrongAnswer: string;
    readonly operatorCount: string;
    readonly level: string;
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
                "%s, your answer is correct! It took you %s seconds!\n```fix\n%s = %s```",
            wrongAnswer:
                "%s, timed out. The correct answer is:\n```fix\n%s = %s```",
            operatorCount: "Operator count",
            level: "Level",
        },
        kr: {
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
        },
        id: {
            userStillHasActiveGame:
                "Hei, kamu masih memiliki persamaan matematika yang harus diselesaikan! Mohon selesaikan persamaan tersebut sebelum membuat persamaan baru!",
            equationGeneratorError:
                "Maaf, pembuat persamaan matematika memiliki masalah dalam membuat persamaan matematikamu, mohon coba lagi!",
            equationQuestion:
                "%s, ini persamaan matematikamu:\n`Jumlah operator %s, level %s`\n```fix\n%s = ...```Kamu memiliki 30 detik untuk menyelesaikannya.",
            correctAnswer:
                "%s, kamu berhasil mendapatkan jawaban yang benar dalam %s detik!\n```fix\n%s = %s```",
            wrongAnswer:
                "%s, waktu habis. Jawaban yang benar adalah:\n```fix\n%s = %s```",
            operatorCount: "Jumlah operator",
            level: "Level",
        },
    };
}
