import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TriviaHelperStrings {
    readonly latestChoiceRecorded: string;
}

/**
 * Localizations for the `TriviaHelper` helper utility.
 */
export class TriviaHelperLocalization extends Localization<TriviaHelperStrings> {
    protected override readonly translations: Readonly<
        Translation<TriviaHelperStrings>
    > = {
        en: {
            latestChoiceRecorded: "Your latest choice (%s) has been recorded!",
        },
        kr: {
            latestChoiceRecorded: "당신의 최근 선택 (%s) (이)가 기록되었어요!",
        },
    };
}
