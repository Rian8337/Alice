import { Translation } from "@localization/base/Translation";
import { VerifyStrings } from "../VerifyLocalization";

/**
 * The English translation for the `verify` command.
 */
export class VerifyENTranslation extends Translation<VerifyStrings> {
    override readonly translations: VerifyStrings = {
        commandNotAvailableInChannel:
            "I'm sorry, this command cannot be used in this channel.",
        userIsNotInThread: "I'm sorry, the user is not in this thread!",
        userIsNotInVerification:
            "I'm sorry, the user is currently not in verification process!",
        userIsAlreadyVerifiedError: "I'm sorry, the user is already verified!",
        verificationSuccess:
            "Successfully verified the user. Closing the thread.",
    };
}
