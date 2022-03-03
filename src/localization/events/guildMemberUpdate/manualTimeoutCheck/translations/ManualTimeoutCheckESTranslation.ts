import { Translation } from "@alice-localization/base/Translation";
import { ManualTimeoutCheckStrings } from "../ManualTimeoutCheckLocalization";

/**
 * The Spanish translation for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckESTranslation extends Translation<ManualTimeoutCheckStrings> {
    override readonly translations: ManualTimeoutCheckStrings = {
        notSpecified: "No especificado.",
    };
}
