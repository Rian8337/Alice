import { Translation } from "@alice-localization/base/Translation";
import { MusicManagerStrings } from "../MusicManagerLocalization";

/**
 * The Indonesian translation for the `MusicManager` manager utility.
 */
export class MusicManagerIDTranslation extends Translation<MusicManagerStrings> {
    override readonly translations: MusicManagerStrings = {
        failedToJoinVc: "",
        videoAlreadyQueued: "",
        queueLimitReached: "",
        botNotInVc: "",
        botNotInUserVc: "",
        noMusicPlaying: "",
        playbackNotPaused: "",
    };
}
