import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

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
    protected override readonly translations: Readonly<
        Translation<VerifyStrings>
    > = {
        en: {
            commandNotAvailableInChannel:
                "I'm sorry, this command cannot be used in this channel.",
            userIsNotInThread: "I'm sorry, the user is not in this thread!",
            userIsNotInVerification:
                "I'm sorry, the user is currently not in verification process!",
            userIsAlreadyVerifiedError:
                "I'm sorry, the user is already verified!",
            verificationSuccess:
                "Successfully verified the user. Closing the thread.",
        },
    };
}
