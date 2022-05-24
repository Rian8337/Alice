import { Translation } from "@alice-localization/base/Translation";
import { MultiplayerRoomStrings } from "../MultiplayerRoomLocalization";

/**
 * The Korean translation for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomKRTranslation extends Translation<MultiplayerRoomStrings> {
    override readonly translations: MultiplayerRoomStrings = {
        scoreV1: "",
        accuracy: "",
        maxCombo: "",
        scoreV2: "",
        most300s: "",
        least100s: "",
        least50s: "",
        leastMisses: "",
        leastUnstableRate: "",
        mostDroidPp: "",
        mostPcPp: "",
        headToHead: "",
        teamVS: "",
        redTeam: "",
        blueTeam: "",
        roomId: "",
        host: "",
        creationDate: "",
        password: "",
        playerCount: "",
        currentBeatmap: "",
        settings: "",
        teamMode: "",
        winCondition: "",
        allowSliderLock: "",
        allowedMods: "",
        requiredMods: "",
        roomResults: "",
        draw: "",
        won: "",
        none: "",
        totalScore: "",
        scorePortion: "",
        forceAR: "",
        speedMultiplier: "",
        incorrectBeatmapPlayed: "",
        sliderLockEnabled: "",
        submissionTooEarly: "",
        submissionTooLate: "",
        requiredModsMissing: "",
        restrictedModsUsed: "",
        incorrectSpeedMultiplier: "",
        forceARUsed: "",
        forceAROutOfRange: "",
    };
}
