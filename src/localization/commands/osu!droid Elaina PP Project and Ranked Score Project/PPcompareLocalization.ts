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
    readonly totalPP: string; // see 39.6
}

/**
 * Localizations for the `ppcompare` command.
 */
export class PPcompareLocalization extends Localization<PPcompareStrings> {
    protected override readonly translations: Readonly<
        Translation<PPcompareStrings>
    > = {
        en: {
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
        },
        kr: {
            cannotCompareSamePlayers: "",
            playerNotBinded: '죄송해요, %s "%s"은(는) 바인딩 되어있지 않아요!',
            uid: "uid",
            username: "유저",
            user: "유저네임",
            noSimilarPlayFound:
                "죄송해요, 두 플레이어가 겹치는 최고 성과(Top play)가 없네요!",
            topPlaysComparison: "",
            player: "",
            totalPP: "총 PP",
        },
        id: {
            cannotCompareSamePlayers: "",
            playerNotBinded: "",
            uid: "",
            username: "",
            user: "",
            noSimilarPlayFound: "",
            topPlaysComparison: "",
            player: "",
            totalPP: "",
        },
    };
}
