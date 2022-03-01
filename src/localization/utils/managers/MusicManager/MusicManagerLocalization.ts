import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MusicManagerENTranslation } from "./translations/MusicManagerENTranslation";
import { MusicManagerIDTranslation } from "./translations/MusicManagerIDTranslation";
import { MusicManagerKRTranslation } from "./translations/MusicManagerKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<MusicManagerStrings>
    > = {
        en: new MusicManagerENTranslation(),
        kr: new MusicManagerKRTranslation(),
        id: new MusicManagerIDTranslation(),
    };
}
