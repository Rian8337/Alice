import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PPcheckStrings {
    readonly tooManyOptions: "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!";
}

/**
 * Localizations for `ppcheck` command.
 */
export class PPcheckLocalization extends Localization<PPcheckStrings> {
    protected override readonly translations: Readonly<
        Translation<PPcheckStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        },
    };
}
