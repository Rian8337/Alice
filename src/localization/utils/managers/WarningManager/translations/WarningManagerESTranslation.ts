import { Translation } from "@localization/base/Translation";
import { WarningManagerStrings } from "../WarningManagerLocalization";

/**
 * The Spanish translation for the `WarningManager` manager utility.
 */
export class WarningManagerESTranslation extends Translation<WarningManagerStrings> {
    override readonly translations: WarningManagerStrings = {
        channelNotSendable: "",
        notInServer: "",
        userIsImmune: "",
        userNotFoundInServer: "",
        invalidDuration: "",
        durationOutOfRange: "",
        notEnoughPermissionToWarn: "",
        reasonTooLong: "",
        warningIssued: "",
        warningId: "",
        warningUnissued: "",
        warningTransferred: "",
        fromUser: "",
        toUser: "",
        userId: "ID del Usuario",
        channelId: "ID del Canal",
        warningIssueInChannel: "",
        warnedUser: "",
        inChannel: "en %s",
        warningReason: "",
        warningUnissueReason: "",
        reason: "Razon",
        points: "Puntos",
        notSpecified: "No especificado.",
        warnIssueUserNotification: "",
        warnUnissueUserNotification: "",
    };
}
