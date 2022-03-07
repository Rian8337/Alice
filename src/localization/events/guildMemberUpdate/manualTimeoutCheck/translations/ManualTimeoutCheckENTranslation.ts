import { Translation } from "@alice-localization/base/Translation";
import { ManualTimeoutCheckStrings } from "../ManualTimeoutCheckLocalization";

/**
 * The English translation for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckENTranslation extends Translation<ManualTimeoutCheckStrings> {
    override readonly translations: ManualTimeoutCheckStrings = {
        notSpecified: "Not specified.",
        timeoutExecuted: "Timeout executed",
        untimeoutExecuted: "Untimeout executed",
        inChannel: "in %s",
        reason: "Reason",
        timeoutUserNotification:
            "Hey, you were timeouted for %s for %s. Sorry!",
        untimeoutUserNotification: "Hey, you were untimeouted for %s.",
        userId: "User ID",
        channelId: "Channel ID",
    };
}
