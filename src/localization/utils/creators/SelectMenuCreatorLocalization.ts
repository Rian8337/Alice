import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SelectMenuCreatorStrings {
    readonly pleaseWait: string;
    readonly timedOut: string;
}

/**
 * Localizations for the `SelectMenuCreator` creator utility.
 */
export class SelectMenuCreatorLocalization extends Localization<SelectMenuCreatorStrings> {
    protected override readonly translations: Readonly<
        Translation<SelectMenuCreatorStrings>
    > = {
        en: {
            pleaseWait: "Please wait...",
            timedOut: "Timed out.",
        },
    };
}
