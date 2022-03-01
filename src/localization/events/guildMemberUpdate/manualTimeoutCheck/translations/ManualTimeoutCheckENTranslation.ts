import { Translation } from "@alice-localization/base/Translation";
import { ManualTimeoutCheckStrings } from "../ManualTimeoutCheckLocalization";

/**
 * The English translation for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckENTranslation extends Translation<ManualTimeoutCheckStrings> {
    override readonly translations: ManualTimeoutCheckStrings = {
        notSpecified: "Not specified.",
    };
}
