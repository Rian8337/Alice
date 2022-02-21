import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MusicManagerStrings {
    readonly failedToJoinVc: string;
    readonly videoAlreadyQueued: string;
    readonly queueLimitReached: string;
    readonly botNotInVc: string;
    readonly botNotInUserVc: string;
    readonly noMusicPlaying: string;
    readonly playbackNotPaused: string;
}

/**
 * Localizations for the `MusicManager` manager utility.
 */
export class MusicManagerLocalization extends Localization<MusicManagerStrings> {
    protected override readonly translations: Readonly<
        Translation<MusicManagerStrings>
    > = {
        en: {
            failedToJoinVc: "failed to join voice channel within 20 seconds",
            videoAlreadyQueued: "video is already queued",
            queueLimitReached:
                "queue limit reached, only up to 10 items allowed",
            botNotInVc: "I'm not in a voice channel",
            botNotInUserVc: "I'm not in your voice channel",
            noMusicPlaying: "no music is playing",
            playbackNotPaused: "playback is not paused",
        },
    };
}
