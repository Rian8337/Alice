import { Translation } from "@alice-localization/base/Translation";
import { PPcompareStrings } from "../PPcompareLocalization";

/**
 * The English translation for the `ppcompare` command.
 */
export class PPcompareENTranslation extends Translation<PPcompareStrings> {
    override readonly translations: PPcompareStrings = {
        cannotCompareSamePlayers:
            "Hey, you cannot compare two of the same players!",
        playerNotBinded: 'I\'m sorry, the %s "%s" is not binded!',
        uid: "uid",
        username: "username",
        user: "user",
        noSimilarPlayFound:
            "I'm sorry, both players do not have any intersecting top plays!",
        topPlaysComparison: "Top PP Plays Comparison",
        player: "Player",
        totalPP: "Total PP",
    };
}
