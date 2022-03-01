import { Translation } from "@alice-localization/base/Translation";
import { PlayertrackStrings } from "../PlayertrackLocalization";

/**
 * The Korean translation for the `playertrack` command.
 */
export class PlayertrackKRTranslation extends Translation<PlayertrackStrings> {
    override readonly translations: PlayertrackStrings = {
        incorrectUid: "저기, 올바른 uid를 입력해 주세요!",
        nowTrackingUid: "이제부터 uid %s를 추적할게요.",
        noLongerTrackingUid: "더이상 uid %s를 추적하지 않을게요.",
    };
}
