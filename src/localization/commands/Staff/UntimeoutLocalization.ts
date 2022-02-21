import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UntimeoutStrings {
    readonly userCannotUntimeoutError: string;
    readonly untimeoutFailed: string;
    readonly untimeoutSuccessful: string;
}

/**
 * Localizations for the `untimeout` command.
 */
export class UntimeoutLocalization extends Localization<UntimeoutStrings> {
    protected override readonly translations: Readonly<
        Translation<UntimeoutStrings>
    > = {
        en: {
            userCannotUntimeoutError:
                "I'm sorry, you don't have the permission to untimeout the user.",
            untimeoutFailed: "I'm sorry, I cannot untimeout the user: `%s`.",
            untimeoutSuccessful: "Successfully untimeouted the user.",
        },
    };
}
