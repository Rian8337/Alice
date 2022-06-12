import { Translation } from "@alice-localization/base/Translation";
import { PlayertrackStrings } from "../PlayertrackLocalization";

/**
 * The English translation for the `playertrack` command.
 */
export class PlayertrackENTranslation extends Translation<PlayertrackStrings> {
    override readonly translations: PlayertrackStrings = {
        incorrectUid: "Hey, please enter a correct uid!",
        nowTrackingUid: "Now tracking uid %s.",
        noLongerTrackingUid: "No longer tracking uid %s.",
    };
}
