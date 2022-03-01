import { Translation } from "@alice-localization/base/Translation";
import { UntimeoutStrings } from "../UntimeoutLocalization";

/**
 * The Indonesian translation for the `untimeout` command.
 */
export class UntimeoutIDTranslation extends Translation<UntimeoutStrings> {
    override readonly translations: UntimeoutStrings = {
        userCannotUntimeoutError: "",
        untimeoutFailed: "",
        untimeoutSuccessful: "",
    };
}
