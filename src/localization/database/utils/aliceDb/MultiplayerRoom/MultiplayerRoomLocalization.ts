import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MultiplayerRoomENTranslation } from "./translations/MultiplayerRoomENTranslation";

export interface MultiplayerRoomStrings {
    readonly scoreV1: string;
    readonly accuracy: string;
    readonly maxCombo: string;
    readonly scoreV2: string;
    readonly most300s: string;
    readonly least100s: string;
    readonly least50s: string;
    readonly leastMisses: string;
    readonly leastUnstableRate: string;
    readonly mostDroidPp: string;
    readonly mostPcPp: string;
    readonly headToHead: string;
    readonly teamVS: string;
    readonly redTeam: string;
    readonly blueTeam: string;
    readonly roomId: string;
    readonly host: string;
    readonly creationDate: string;
    readonly password: string;
    readonly playerCount: string;
    readonly currentBeatmap: string;
    readonly settings: string;
    readonly teamMode: string;
    readonly winCondition: string;
    readonly allowSliderLock: string;
    readonly useSliderAccuracy: string;
    readonly allowedMods: string;
    readonly requiredMods: string;
    readonly roomResults: string;
    readonly draw: string;
    readonly won: string;
    readonly none: string;
    readonly totalScore: string;
    readonly scorePortion: string;
    readonly forceAR: string;
    readonly speedMultiplier: string;
    readonly customModMultipliers: string;
    readonly scoreNotFound: string;
    readonly incorrectBeatmapPlayed: string;
    readonly sliderLockEnabled: string;
    readonly useSliderAccuracySettingDoesntMatch: string;
    readonly submissionTooEarly: string;
    readonly submissionTooLate: string;
    readonly requiredModsMissing: string;
    readonly restrictedModsUsed: string;
    readonly incorrectSpeedMultiplier: string;
    readonly forceARUsed: string;
    readonly forceAROutOfRange: string;
}

/**
 * Localizations for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomLocalization extends Localization<MultiplayerRoomStrings> {
    protected override readonly localizations: Readonly<
        Translations<MultiplayerRoomStrings>
    > = {
        en: new MultiplayerRoomENTranslation(),
    };
}
