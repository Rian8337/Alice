import { Translation } from "@localization/base/Translation";
import { SimulateStrings } from "../SimulateLocalization";

/**
 * The Indonesian translation for the `simulate` command.
 */
export class SimulateIDTranslation extends Translation<SimulateStrings> {
    override readonly translations: SimulateStrings = {
        noSimulateOptions: "",
        tooManyOptions:
            "Maaf, kamu hanya dapat memasukkan uid, pengguna, atau username! Kamu tidak dapat menggabung mereka!",
        playerNotFound:
            "Maaf, aku tidak dapat menemukan pemain yang kamu berikan!",
        playerHasNoRecentPlays:
            "Maaf, pemain ini belum pernah mengirimkan skor!",
        noBeatmapProvided:
            "Hei, tidak ada beatmap yang sedang diobrolkan dalam channel ini!",
        beatmapProvidedIsInvalid: "Hei, mohon berikan beatmap yang benar!",
        beatmapNotFound:
            "Maaf, aku tidak dapat menemukan beatmap yang kamu berikan!",
        selfScoreNotFound: "Maaf, kamu belum pernah memainkan beatmap ini!",
        userScoreNotFound:
            "Maaf, pemain tersebut belum pernah memainkan beatmap ini!",
        simulatedPlayDisplay: "Simulasi skor untuk %s:",
    };
}
