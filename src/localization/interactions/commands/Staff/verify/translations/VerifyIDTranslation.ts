import { Translation } from "@alice-localization/base/Translation";
import { VerifyStrings } from "../VerifyLocalization";

/**
 * The Indonesian translation for the `verify` command.
 */
export class VerifyIDTranslation extends Translation<VerifyStrings> {
    override readonly translations: VerifyStrings = {
        commandNotAvailableInChannel: "",
        userIsNotInThread: "",
        userIsNotInVerification: "",
        userIsAlreadyVerifiedError: "",
        verificationSuccess: "",
    };
}
