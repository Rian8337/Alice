import { Translation } from "@alice-localization/base/Translation";
import { MusicStrings } from "../MusicLocalization";

/**
 * The Korean translation for the `music` command.
 */
export class MusicKRTranslation extends Translation<MusicStrings> {
    override readonly translations: MusicStrings = {
        userIsNotInVoiceChannel:
            "죄송해요, 이 명령어를 사용하려면 보이스 채널에 있으셔야 해요!",
        botIsNotInVoiceChannel:
            "죄송해요, 제가 보이스 채널에 연결되지 않았어요!",
        noMusicIsPlaying: "죄송해요, 재생중인 음악이 없네요!",
        noTracksFound: "죄송해요, 해당 검색어로 유튜브 동영상을 찾지 못했어요!",
        playTrackFailed: "죄송해요, 트랙을 재생하지 못했어요: %s.",
        playTrackSuccess:
            "다음 음악(영상)을 성공적으로 재생했어요/재생목록에 넣었어요: %s",
        skipTrackFailed: "죄송해요, 트랙을 스킵하지 못했어요: %s.",
        skipTrackSuccess: "성공적으로 트랙을 스킵했어요.",
        pauseTrackFailed: "죄송해요, 트랙을 일시정지하지 못했어요: %s.",
        pauseTrackSuccess: "성공적으로 현재 트랙을 일시정지 했어요.",
        resumeTrackFailed: "죄송해요, 트랙을 재개하지 못했어요: %s.",
        resumeTrackSuccess: "성공적으로 현재 트랙을 재개했어요.",
        leaveChannelFailed: "죄송해요, 보이스 채널을 떠나지 못했어요: %s.",
        leaveChannelSuccess: "죄송해요, 보이스 채널을 떠나지 못했어요: %s.",
        repeatModeFailed:
            "죄송해요, 트랙에 대한 반복 모드를 수정하지 못했어요: %s.",
        repeatModeEnableSuccess: "성공적으로 반복 모드를 활성화했어요.",
        repeatModeDisableSuccess: "성공적으로 반복 모드를 비활성화했어요.",
        shuffleFailed: "죄송해요, 재생 목록을 섞지 못했어요: %s.",
        shuffleSuccess: "성공적으로 재생 목록을 섞었어요.",
        addQueueFailed: "죄송해요, 동영상을 재생목록에 넣지 못했어요: %s.",
        addQueueSuccess: "성공적으로 %s를 재생목록에 넣었어요.",
        removeQueueFailed: "죄송해요, 재생목록에서 %s를 제거하지 못했어요: %s.",
        removeQueueSuccess: "성공적으로 %s를 재생목록에서 제거했어요.",
        createCollectionFailed: "죄송해요, 컬렉션을 만들 수 없었어요: %s.",
        createCollectionSuccess: "성공적으로 %s 컬렉션을 만들었어요.",
        deleteCollectionFailed: "죄송해요, 컬렉션을 삭제할 수 없었어요: %s.",
        deleteCollectionSuccess: "성공적으로 %s 컬렉션을 제거했어요.",
        addVideoToCollectionFailed:
            "죄송해요, 컬렉션에 동영상을 추가할 수 없었어요: %s.",
        addVideoToCollectionSuccess:
            "성공적으로 동영상을 %s 컬렉션의 %s 위치에 추가했어요.",
        removeVideoFromCollectionFailed:
            "죄송해요, 지정한 위치의 동영상 링크를 제거하지 못했어요: %s.",
        removeVideoFromCollectionSuccess:
            "성공적으로 %s 위치의 동영상 링크를 컬렉션 %s에서 제거했어요.",
        queueIsEmpty: "죄송해요, 재생목록에 음악이 없어요!",
        selfHasNoCollection: "죄송해요, 음악 컬렉션을 가지고 있지 않으시네요!",
        userHasNoCollection:
            "죄송해요, 이 유저는 음악 컬렉션을 가지고 있지 않네요!",
        noCollectionWithName: "죄송해요, 그런 이름의 음악 컬렉션은 없어요!",
        collectionWithNameAlreadyExists:
            "죄송해요, 그 이름의 음악 컬렉션은 이미 존재해요!",
        userDoesntOwnCollection:
            "죄송해요, 당신은 이 음악 컬렉션의 소유자가 아니시네요!",
        collectionLimitReached:
            "죄송해요, 음악 컬렉션엔 영상을 10개까지만 넣을 수 있어요!",
        enqueueFromCollectionSuccess:
            "성공적으로 음악 컬렉션의 %s개의 동영상을 재생목록에 넣었어요.",
        chooseVideo: "비디오를 선택.",
        currentQueue: "현재 재생목록",
        requestedBy: "%s에 의해 요청됨/재생목록에 넣어짐",
        musicInfo: "음악 정보",
        playingSince: "다음 시간부터 재생중",
        currentlyPlaying: "현재 재생중",
        channel: "채널",
        duration: "길이",
        none: "없음",
        playbackSettings: "재생 설정",
        repeatMode: "반복 모드",
        enabled: "활성화됨",
        disabled: "비활성화됨",
        queue: "재생목록",
        totalCollections: "총 콜렉션",
        createdAt: "%s에 만들어짐",
        collectionOwner: "소유자",
        creationDate: "만들어진 날짜",
        collectionLinks: "링크",
    };
}
