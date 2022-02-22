import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ScoreDisplayHelperStrings {
    readonly recentPlays: string;
}

/**
 * Localizations for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperLocalization extends Localization<ScoreDisplayHelperStrings> {
    protected override readonly translations: Readonly<
        Translation<ScoreDisplayHelperStrings>
    > = {
        en: {
            recentPlays: "Recent plays for %s",
        },
        kr: {
            recentPlays: "%s의 최근 플레이",
        },
    };
}
