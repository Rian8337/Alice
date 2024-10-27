import { Translation } from "@localization/base/Translation";
import { MusicManagerStrings } from "../MusicManagerLocalization";

/**
 * The Spanish translation for the `MusicManager` manager utility.
 */
export class MusicManagerESTranslation extends Translation<MusicManagerStrings> {
    override readonly translations: MusicManagerStrings = {
        failedToJoinVc: "error al unirse al canal de voz cada 20 segundos",
        videoAlreadyQueued: "video ya en cola",
        queueLimitReached:
            "limite de cola alcanzado, maximo de 10 pedidos permitidos",
        botNotInVc: "No estoy en un canal de voz",
        botNotInUserVc: "No estoy en tu mismo canal de voz",
        noMusicPlaying: "no hay musica reproduciendose",
        playbackNotPaused: "la musica no esta en pausa",
    };
}
