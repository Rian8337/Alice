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
        kr: {
            failedToJoinVc: "20초간 보이스 채널에 참가하는데 실패함",
            videoAlreadyQueued: "영상이 이미 재생목록에 있음",
            queueLimitReached: "재생목록 최대치 도달, 10개까지만 가능",
            botNotInVc: "제가 보이스 채널에 없어요",
            botNotInUserVc: "제가 당신의 보이스 채널에 없어요",
            noMusicPlaying: "재생중인 음악 없음",
            playbackNotPaused: "재생이 일시정지되지 않음",
        },
    };
}
