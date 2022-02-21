import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PlayerInfoStrings {
    readonly tooMuchCoinDeduction: string;
    readonly dailyClaimUsed: string;
    readonly dailyLimitReached: string;
}

/**
 * Localizations for the `PlayerInfo` database utility.
 */
export class PlayerInfoLocalization extends Localization<PlayerInfoStrings> {
    protected override readonly translations: Readonly<Translation<PlayerInfoStrings>> = {
        en: {
            tooMuchCoinDeduction: "too much coin deduction; can only deduct at most %s Alice coins",
            dailyClaimUsed: "daily claim has been used",
            dailyLimitReached: "transferred amount is beyond daily limit—can only transfer %s Alice coins left."
        }
    };
}