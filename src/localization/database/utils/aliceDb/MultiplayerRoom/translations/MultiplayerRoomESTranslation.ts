import { Translation } from "@alice-localization/base/Translation";
import { MultiplayerRoomStrings } from "../MultiplayerRoomLocalization";

/**
 * The Spanish translation for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomESTranslation extends Translation<MultiplayerRoomStrings> {
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
    };
}
