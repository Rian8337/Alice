import { Translation } from "@alice-localization/base/Translation";
import { MultiplayerRoomStrings } from "../MultiplayerRoomLocalization";

/**
 * The English translation for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomENTranslation extends Translation<MultiplayerRoomStrings> {
    override readonly translations: MultiplayerRoomStrings = {
        scoreV1: "Score V1",
        accuracy: "Accuracy",
        maxCombo: "Maximum Combo",
        scoreV2: "Score V2",
        most300s: "Most 300s",
        least100s: "Least 100s",
        least50s: "Least 50s",
        leastMisses: "Least Misses",
        leastUnstableRate: "Least Unstable Rate",
        headToHead: "Head-to-head",
        teamVS: "Team VS",
    };
}
