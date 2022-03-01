import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CoinsENTranslation } from "./translations/CoinsENTranslation";
import { CoinsIDTranslation } from "./translations/CoinsIDTranslation";
import { CoinsKRTranslation } from "./translations/CoinsKRTranslation";

export interface CoinsStrings {
    readonly userNotInServerForAWeek: string;
    readonly dailyClaimFailed: string;
    readonly dailyClaimSuccess: string;
    readonly dailyClaimWithStreakSuccess: string;
    readonly selfCoinAmountInfo: string;
    readonly userCoinAmountInfo: string;
    readonly userToTransferNotFound: string;
    readonly userToTransferIsBot: string;
    readonly userToTransferIsSelf: string;
    readonly transferAmountInvalid: string;
    readonly userToTransferNotInServerForAWeek: string;
    readonly userDoesntHaveCoinsInfo: string;
    readonly otherUserDoesntHaveCoinsInfo: string;
    readonly cannotFetchPlayerInformation: string;
    readonly notEnoughCoinsToTransfer: string;
    readonly coinTransferConfirmation: string;
    readonly coinTransferFailed: string;
    readonly coinTransferSuccess: string;
    readonly addAmountInvalid: string;
    readonly addCoinSuccess: string;
    readonly addCoinFailed: string;
    readonly removeAmountInvalid: string;
    readonly removeCoinFailed: string;
    readonly removeCoinSuccess: string;
}

/**
 * Localizations for the `coins` command.
 */
export class CoinsLocalization extends Localization<CoinsStrings> {
    protected override readonly localizations: Readonly<
        Translations<CoinsStrings>
    > = {
        en: new CoinsENTranslation(),
        kr: new CoinsKRTranslation(),
        id: new CoinsIDTranslation(),
    };
}
