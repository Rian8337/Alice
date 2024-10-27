import { Translation } from "@localization/base/Translation";
import { MathgameStrings } from "../MathgameLocalization";

/**
 * The Indonesian translation for the `mathgame` command.
 */
export class MathgameIDTranslation extends Translation<MathgameStrings> {
    override readonly translations: MathgameStrings = {
        userHasOngoingGame:
            "Hei, kamu masih memiliki permainan yang sedang berlangsung! Mohon mainkan permainan tersebut terlebih dahulu!",
        channelHasOngoingGame:
            "Hei, masih ada permainan yang sedang berlangsung di channel ini! Mohon mainkan permainan tersebut terlebih dahulu!",
        gameStartedNotification: "Permainan dimulai!",
        couldNotFetchEquationGameEnd:
            "Maaf, aku tidak dapat membuat persamaan matematika lagi setelah %s kali percobaan. Oleh karena itu, permainan diselesaikan!",
        noAnswerGameEnd:
            "Permainan selesai! Jawaban yang benar adalah:\n```fix\n%s = %s```",
        singleGamemodeQuestion:
            "%s, selesaikan persamaan matematika ini dalam 30 detik!\n`Jumlah operator %s, level %s`\n```fix\n%s = ...```",
        multiGamemodeQuestion:
            "Selesaikan persamaan matematika ini dalam 30 detik (level %s, jumlah operator %s)!\n```fix\n%s = ...```",
        correctAnswer:
            "%s berhasil mendapatkan jawaban yang benar dalam %s detik!\n```fix\n%s = %s```",
        gameStatistics: "Statistika Permainan Matematika",
        gameStarter: "Pemulai",
        timeStarted: "Waktu dimulai",
        duration: "Durasi",
        levelReached: "Level tercapai",
        operatorCount: "Jumlah operator",
        level: "Level",
        totalCorrectAnswers: "Jumlah jawaban benar",
        answers: "jawaban",
    };
}
