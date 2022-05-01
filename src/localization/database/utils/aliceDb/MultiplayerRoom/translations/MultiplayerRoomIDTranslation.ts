import { Translation } from "@alice-localization/base/Translation";
import { MultiplayerRoomStrings } from "../MultiplayerRoomLocalization";

/**
 * The Indonesian translation for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomIDTranslation extends Translation<MultiplayerRoomStrings> {
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
        headToHead: "",
        teamVS: "",
    };
}
