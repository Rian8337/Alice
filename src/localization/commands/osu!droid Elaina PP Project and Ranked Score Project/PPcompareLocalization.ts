import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PPcompareStrings {
    readonly cannotCompareSamePlayers: string;
    readonly playerNotBinded: string;
    readonly uid: string;
    readonly username: string;
    readonly user: string;
    readonly noSimilarPlayFound: string;
    readonly topPlaysComparison: string;
    readonly player: string;
    readonly totalPP: string;
}

/**
 * Localizations for the `ppcompare` command.
 */
export class PPcompareLocalization extends Localization<PPcompareStrings> {
    protected override readonly translations: Readonly<Translation<PPcompareStrings>> = {
        en: {
            cannotCompareSamePlayers: "Hey, you cannot compare two of the same players!",
            playerNotBinded: 'I\'m sorry, the %s "%s" is not binded!',
            uid: "uid",
            username: "username",
            user: "user",
            noSimilarPlayFound: "I'm sorry, both players do not have any intersecting top plays!",
            topPlaysComparison: "Top PP Plays Comparison",
            player: "Player",
            totalPP: "Total PP",
        }
    };
}