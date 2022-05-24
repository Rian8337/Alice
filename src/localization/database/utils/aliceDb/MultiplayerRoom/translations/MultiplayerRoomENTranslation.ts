import { Translation } from "@alice-localization/base/Translation";
import { MultiplayerRoomStrings } from "../MultiplayerRoomLocalization";

/**
 * The English translation for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomENTranslation extends Translation<MultiplayerRoomStrings> {
    override readonly translations: MultiplayerRoomStrings = {
        scoreV1: "Highest Score V1",
        accuracy: "Highest Accuracy",
        maxCombo: "Highest Maximum Combo",
        scoreV2: "Highest Score V2",
        most300s: "Most 300s",
        least100s: "Least 100s",
        least50s: "Least 50s",
        leastMisses: "Least Misses",
        leastUnstableRate: "Lowest Unstable Rate",
        mostDroidPp: "Highest Droid PP",
        mostPcPp: "Highest PC PP",
        headToHead: "Head-to-head",
        teamVS: "Team VS",
        redTeam: "Red",
        blueTeam: "Blue",
        roomResults: "Results",
        draw: "It's a draw",
        won: "%s won",
        none: "None",
        roomId: "Room ID",
        host: "Host",
        creationDate: "Creation Date",
        password: "Password",
        playerCount: "Players",
        currentBeatmap: "Current Beatmap",
        settings: "Settings",
        teamMode: "Team Mode",
        winCondition: "Win Condition",
        allowSliderLock: "Allow Slider Lock",
        allowedMods: "Allowed Mods",
        requiredMods: "Required Mods",
        totalScore: "Total",
        scorePortion: "Score Portion",
        forceAR: "Force AR",
        speedMultiplier: "Speed Multiplier",
        incorrectBeatmapPlayed: "Incorrect beatmap played",
        sliderLockEnabled: "2B slider lock is enabled",
        submissionTooEarly: "Score submitted too early",
        submissionTooLate: "Score submitted too late",
        requiredModsMissing: "Missing required mods: %s",
        restrictedModsUsed: "Restricted mods were used: %s",
        incorrectSpeedMultiplier: "Incorrect speed multiplier",
        forceARUsed: "Force AR enabled",
        forceAROutOfRange: "Force AR value out of range",
    };
}
