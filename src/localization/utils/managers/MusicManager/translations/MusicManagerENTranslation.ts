import { Translation } from "@alice-localization/base/Translation";
import { MusicManagerStrings } from "../MusicManagerLocalization";

/**
 * The English translation for the `MusicManager` manager utility.
 */
export class MusicManagerENTranslation extends Translation<MusicManagerStrings> {
    override readonly translations: MusicManagerStrings = {
        failedToJoinVc: "failed to join voice channel within 20 seconds",
        videoAlreadyQueued: "video is already queued",
        queueLimitReached: "queue limit reached, only up to 10 items allowed",
        botNotInVc: "I'm not in a voice channel",
        botNotInUserVc: "I'm not in your voice channel",
        noMusicPlaying: "no music is playing",
        playbackNotPaused: "playback is not paused",
    };
}
