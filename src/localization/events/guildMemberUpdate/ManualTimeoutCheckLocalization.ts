import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ManualTimeoutCheckStrings {
    readonly notSpecified: string;
}

/**
 * Localizations for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckLocalization extends Localization<ManualTimeoutCheckStrings> {
    protected override readonly translations: Readonly<
        Translation<ManualTimeoutCheckStrings>
    > = {
        en: {
            notSpecified: "Not specified.",
        },
        kr: {
            notSpecified: "지정되지 않음.",
        },
        id: {
            notSpecified: "",
        },
    };
}
