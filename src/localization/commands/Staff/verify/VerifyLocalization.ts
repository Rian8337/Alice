import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { VerifyENTranslation } from "./translations/VerifyENTranslation";
import { VerifyIDTranslation } from "./translations/VerifyIDTranslation";
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
        id: new VerifyIDTranslation(),
    };
}
