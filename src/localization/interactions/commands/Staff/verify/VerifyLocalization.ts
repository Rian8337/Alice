import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { VerifyENTranslation } from "./translations/VerifyENTranslation";
import { VerifyESTranslation } from "./translations/VerifyESTranslation";
import { VerifyKRTranslation } from "./translations/VerifyKRTranslation";

export interface VerifyStrings {
    readonly commandNotAvailableInChannel: string;
    readonly userIsNotInThread: string;
    readonly userIsNotInVerification: string;
    readonly userIsAlreadyVerifiedError: string;
    readonly verificationSuccess: string;
}

/**
 * Localizations for the `verify` command.
 */
export class VerifyLocalization extends Localization<VerifyStrings> {
    protected override readonly localizations: Readonly<
        Translations<VerifyStrings>
    > = {
        en: new VerifyENTranslation(),
        kr: new VerifyKRTranslation(),
        es: new VerifyESTranslation(),
    };
}
