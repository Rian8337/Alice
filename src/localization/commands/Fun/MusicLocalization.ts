import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MusicStrings {
    readonly userIsNotInVoiceChannel: string;
    readonly botIsNotInVoiceChannel: string;
    readonly noMusicIsPlaying: string;
    readonly noTracksFound: string;
    readonly playTrackFailed: string;
    readonly playTrackSuccess: string;
    readonly skipTrackFailed: string;
    readonly skipTrackSuccess: string;
    readonly pauseTrackFailed: string;
    readonly pauseTrackSuccess: string;
    readonly resumeTrackFailed: string;
    readonly resumeTrackSuccess: string;
    readonly leaveChannelFailed: string;
    readonly leaveChannelSuccess: string;
    readonly repeatModeFailed: string;
    readonly repeatModeEnableSuccess: string;
    readonly repeatModeDisableSuccess: string;
    readonly shuffleFailed: string;
    readonly shuffleSuccess: string;
    readonly addQueueFailed: string;
    readonly addQueueSuccess: string;
    readonly removeQueueFailed: string;
    readonly removeQueueSuccess: string;
    readonly createCollectionFailed: string;
    readonly createCollectionSuccess: string;
    readonly deleteCollectionFailed: string;
    readonly deleteCollectionSuccess: string;
    readonly addVideoToCollectionFailed: string;
    readonly addVideoToCollectionSuccess: string;
    readonly removeVideoFromCollectionFailed: string;
    readonly removeVideoFromCollectionSuccess: string;
    readonly queueIsEmpty: string;
    readonly selfHasNoCollection: string;
    readonly userHasNoCollection: string;
    readonly noCollectionWithName: string;
    readonly collectionWithNameAlreadyExists: string;
    readonly userDoesntOwnCollection: string;
    readonly collectionLimitReached: string;
    readonly enqueueFromCollectionSuccess: string;
    readonly chooseVideo: string;
    readonly currentQueue: string;
    readonly requestedBy: string;
    readonly musicInfo: string;
    readonly playingSince: string;
    readonly currentlyPlaying: string;
    readonly channel: string;
    readonly duration: string;
    readonly none: string;
    readonly playbackSettings: string;
    readonly repeatMode: string;
    readonly enabled: string;
    readonly disabled: string;
    readonly queue: string;
    readonly totalCollections: string;
    readonly createdAt: string;
    readonly collectionOwner: string;
    readonly creationDate: string; // see 22.139
    readonly collectionLinks: string;
}

/**
 * Localizations for the `music` command.
 */
export class MusicLocalization extends Localization<MusicStrings> {
    protected override readonly translations: Readonly<
        Translation<MusicStrings>
    > = {
        en: {
            userIsNotInVoiceChannel:
                "I'm sorry, you must be in a voice channel to use this command!",
            botIsNotInVoiceChannel:
                "I'm sorry, I don't have an active connection to a voice channel!",
            noMusicIsPlaying: "I'm sorry, there is no music playing!",
            noTracksFound:
                "I'm sorry, I couldn't find any YouTube videos from your search query!",
            playTrackFailed: "I'm sorry, I couldn't play the track: %s.",
            playTrackSuccess: "Successfully played or enqueued `%s`.",
            skipTrackFailed: "I'm sorry, I couldn't skip the track: %s.",
            skipTrackSuccess: "Successfully skipped the track.",
            pauseTrackFailed: "I'm sorry, I couldn't pause the track: %s.",
            pauseTrackSuccess: "Successfully paused the current track.",
            resumeTrackFailed: "I'm sorry, I couldn't resume the track: %s.",
            resumeTrackSuccess: "Successfully resumed the current track.",
            leaveChannelFailed:
                "I'm sorry, I couldn't leave the voice channel: %s.",
            leaveChannelSuccess: "Successfully left the voice channel.",
            repeatModeFailed: "I'm sorry, I couldn't modify repeat mode: %s.",
            repeatModeEnableSuccess: "Successfully enabled repeat mode.",
            repeatModeDisableSuccess: "Successfully disabled repeat mode.",
            shuffleFailed: "I'm sorry, I couldn't shuffle the music queue: %s.",
            shuffleSuccess: "Successfully shuffled the music queue.",
            addQueueFailed:
                "I'm sorry, I couldn't add the video into the music queue: %s.",
            addQueueSuccess: "Successfully added `%s` into the music queue.",
            removeQueueFailed:
                "I'm sorry, I couldn't remove `%s` from the music queue: %s.",
            removeQueueSuccess:
                "Successfully removed `%s` from the music queue.",
            createCollectionFailed:
                "I'm sorry, I couldn't create the collection: %s.",
            createCollectionSuccess: "Successfully created collection `%s`.",
            deleteCollectionFailed:
                "I'm sorry, I couldn't delete the collection: %s.",
            deleteCollectionSuccess: "Successfully deleted collection `%s`.",
            addVideoToCollectionFailed:
                "I'm sorry, I couldn't add the video into the collection: %s.",
            addVideoToCollectionSuccess:
                "Successfully added video into collection `%s` at position `%s`.",
            removeVideoFromCollectionFailed:
                "I'm sorry, I couldn't remove the video link in the specified position: %s.",
            removeVideoFromCollectionSuccess:
                "Successfully removed video link at position `%s` from collection `%s`.",
            queueIsEmpty: "I'm sorry, there is no music queued!",
            selfHasNoCollection: "I'm sorry, you have no music collections!",
            userHasNoCollection:
                "I'm sorry, this user has no music collections!",
            noCollectionWithName:
                "I'm sorry, there is no music collection with that name!",
            collectionWithNameAlreadyExists:
                "I'm sorry, a music collection with that name already exists!",
            userDoesntOwnCollection:
                "I'm sorry, you don't own this music collection!",
            collectionLimitReached:
                "I'm sorry, you can only insert up to 10 videos into a music collection!",
            enqueueFromCollectionSuccess:
                "Successfully enqueued %s video(s) from the music collection.",
            chooseVideo: "Choose a video.",
            currentQueue: "Current Queue",
            requestedBy: "Queued/requested by %s",
            musicInfo: "Music Information",
            playingSince: "Playing Since",
            currentlyPlaying: "Currently Playing",
            channel: "Channel",
            duration: "Duration",
            none: "None",
            playbackSettings: "Playback Settings",
            repeatMode: "Repeat mode",
            enabled: "Enabled",
            disabled: "Disabled",
            queue: "Queue",
            totalCollections: "Total Collections",
            createdAt: "Created at",
            collectionOwner: "Owner",
            creationDate: "Creation Date",
            collectionLinks: "Links",
        },
        kr: {
            userIsNotInVoiceChannel:
                "죄송해요, 이 명령어를 사용하려면 보이스 채널에 있으셔야 해요!",
            botIsNotInVoiceChannel:
                "죄송해요, 제가 보이스 채널에 연결되지 않았어요!",
            noMusicIsPlaying: "죄송해요, 재생중인 음악이 없네요!",
            noTracksFound:
                "죄송해요, 해당 검색어로 유튜브 동영상을 찾지 못했어요!",
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
            removeQueueFailed:
                "죄송해요, 재생목록에서 %s를 제거하지 못했어요: %s.",
            removeQueueSuccess: "성공적으로 %s를 재생목록에서 제거했어요.",
            createCollectionFailed: "죄송해요, 컬렉션을 만들 수 없었어요: %s.",
            createCollectionSuccess: "성공적으로 %s 컬렉션을 만들었어요.",
            deleteCollectionFailed:
                "죄송해요, 컬렉션을 삭제할 수 없었어요: %s.",
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
            selfHasNoCollection:
                "죄송해요, 음악 컬렉션을 가지고 있지 않으시네요!",
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
            currentQueue: "",
            requestedBy: "%s에 의해 요청됨/재생목록에 넣어짐",
            musicInfo: "",
            playingSince: "",
            currentlyPlaying: "",
            channel: "",
            duration: "",
            none: "",
            playbackSettings: "",
            repeatMode: "",
            enabled: "",
            disabled: "",
            queue: "",
            totalCollections: "",
            createdAt: "",
            collectionOwner: "",
            creationDate: "",
            collectionLinks: "",
        },
    };
}
