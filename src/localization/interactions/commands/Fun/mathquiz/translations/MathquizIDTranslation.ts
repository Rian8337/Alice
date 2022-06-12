import { Translation } from "@alice-localization/base/Translation";
import { MathquizStrings } from "../MathquizLocalization";

/**
 * The Indonesian translation for the `mathquiz` command.
 */
export class MathquizIDTranslation extends Translation<MathquizStrings> {
    override readonly translations: MathquizStrings = {
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
    };
}
