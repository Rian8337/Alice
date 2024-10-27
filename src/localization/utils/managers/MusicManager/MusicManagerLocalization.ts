import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { MusicManagerENTranslation } from "./translations/MusicManagerENTranslation";
import { MusicManagerESTranslation } from "./translations/MusicManagerESTranslation";
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
        es: new MusicManagerESTranslation(),
    };
}
