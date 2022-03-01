import { Translation } from "@alice-localization/base/Translation";
import { PPcompareStrings } from "../PPcompareLocalization";

/**
 * The Indonesian translation for the `ppcompare` command.
 */
export class PPcompareIDTranslation extends Translation<PPcompareStrings> {
    override readonly translations: PPcompareStrings = {
        cannotCompareSamePlayers: "",
        playerNotBinded: "",
        uid: "",
        username: "",
        user: "",
        noSimilarPlayFound: "",
        topPlaysComparison: "",
        player: "",
        totalPP: "",
    };
}
