import { Translation } from "@localization/base/Translation";
import { UntimeoutStrings } from "../UntimeoutLocalization";

/**
 * The English translation for the `untimeout` command.
 */
export class UntimeoutENTranslation extends Translation<UntimeoutStrings> {
    override readonly translations: UntimeoutStrings = {
        userCannotUntimeoutError:
            "I'm sorry, you don't have the permission to untimeout the user.",
        untimeoutFailed: "I'm sorry, I cannot untimeout the user: `%s`.",
        untimeoutSuccessful: "Successfully untimeouted the user.",
    };
}
