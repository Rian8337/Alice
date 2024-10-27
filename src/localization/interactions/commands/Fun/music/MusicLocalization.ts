import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { MusicENTranslation } from "./translations/MusicENTranslation";
import { MusicESTranslation } from "./translations/MusicESTranslation";
import { MusicKRTranslation } from "./translations/MusicKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<MusicStrings>
    > = {
        en: new MusicENTranslation(),
        kr: new MusicKRTranslation(),
        es: new MusicESTranslation(),
    };
}
