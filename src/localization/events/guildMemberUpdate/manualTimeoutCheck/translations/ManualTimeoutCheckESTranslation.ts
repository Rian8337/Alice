import { Translation } from "@alice-localization/base/Translation";
import { ManualTimeoutCheckStrings } from "../ManualTimeoutCheckLocalization";

/**
 * The Spanish translation for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckESTranslation extends Translation<ManualTimeoutCheckStrings> {
    override readonly translations: ManualTimeoutCheckStrings = {
        notSpecified: "No especificado.",
        timeoutExecuted: "Restricción satisfactoria",
        untimeoutExecuted: "Retiro de Restricción ejecutado",
        inChannel: "en %s",
        reason: "Razon",
        userId: "ID del Usuario",
        channelId: "ID del Canal",
        timeoutUserNotification:
            "Hey, se te restringió por %s con motivo de %s. Sorry!",
        untimeoutUserNotification:
            "Hey, se te fue retirada la restricción por %s.",
    };
}
