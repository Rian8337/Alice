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
                chooseVideo:
                    "Choose a video.",
                currentQueue: "Current Queue",
                requestedBy: "Queued/requested by",
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
            },
        };
}
