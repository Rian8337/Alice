import { Translation } from "@alice-localization/base/Translation";
import { TimeoutStrings } from "../TimeoutLocalization";

/**
 * The Indonesian translation for the `timeout` command.
 */
export class TimeoutIDTranslation extends Translation<TimeoutStrings> {
    override readonly translations: TimeoutStrings = {
        userToTimeoutNotFound: "",
        timeoutFailed: "",
        timeoutSuccess: "",
    };
}
