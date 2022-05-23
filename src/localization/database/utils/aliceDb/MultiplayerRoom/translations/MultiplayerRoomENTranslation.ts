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
    };
}
