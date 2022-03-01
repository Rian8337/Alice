import { Translation } from "@alice-localization/base/Translation";
import { MusicManagerStrings } from "../MusicManagerLocalization";

/**
 * The Korean translation for the `MusicManager` manager utility.
 */
export class MusicManagerKRTranslation extends Translation<MusicManagerStrings> {
    override readonly translations: MusicManagerStrings = {
        failedToJoinVc: "20초간 보이스 채널에 참가하는데 실패함",
        videoAlreadyQueued: "영상이 이미 재생목록에 있음",
        queueLimitReached: "재생목록 최대치 도달, 10개까지만 가능",
        botNotInVc: "제가 보이스 채널에 없어요",
        botNotInUserVc: "제가 당신의 보이스 채널에 없어요",
        noMusicPlaying: "재생중인 음악 없음",
        playbackNotPaused: "재생이 일시정지되지 않음",
    };
}
