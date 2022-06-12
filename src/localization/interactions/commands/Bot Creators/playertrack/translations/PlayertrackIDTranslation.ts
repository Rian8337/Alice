import { Translation } from "@alice-localization/base/Translation";
import { PlayertrackStrings } from "../PlayertrackLocalization";

/**
 * The Indonesian translation for the `playertrack` command.
 */
export class PlayertrackIDTranslation extends Translation<PlayertrackStrings> {
    override readonly translations: PlayertrackStrings = {
        incorrectUid: "Hei, mohon berikan uid yang benar!",
        nowTrackingUid: "Sekarang melacak uid %s.",
        noLongerTrackingUid: "Tidak lagi melacak uid %s.",
    };
}
