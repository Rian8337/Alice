import { Translation } from "@alice-localization/base/Translation";
import { PlayertrackStrings } from "../PlayertrackLocalization";

/**
 * The Spanish translation for the `playertrack` command.
 */
export class PlayertrackESTranslation extends Translation<PlayertrackStrings> {
    override readonly translations: PlayertrackStrings = {
        incorrectUid: "Hey, por favor ingresa un uid correcto!",
        nowTrackingUid: "Rastreando uid %s.",
        noLongerTrackingUid: "Dejando de rastrear uid %s.",
    };
}
