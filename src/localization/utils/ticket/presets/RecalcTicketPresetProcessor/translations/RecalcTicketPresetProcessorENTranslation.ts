import { Translation } from "@localization/base/Translation";
import { RecalcTicketPresetProcessorStrings } from "../RecalcTicketPresetProcessorLocalization";

/**
 * The English translation for the `RecalcTicketPresetProcessor` utility.
 */
export class RecalcTicketPresetProcessorENTranslation extends Translation<RecalcTicketPresetProcessorStrings> {
    override readonly translations: RecalcTicketPresetProcessorStrings = {
        dppBanned: "I'm sorry, this user has been DPP banned!",
        modalReasonPlaceholder:
            "Reason for recalculation (e.g., first-time bind).",
        modalReasonLabel: "Reason",
    };
}
