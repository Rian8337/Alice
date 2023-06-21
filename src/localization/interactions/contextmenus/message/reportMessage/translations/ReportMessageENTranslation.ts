import { Translation } from "@alice-localization/base/Translation";
import { ReportMessageStrings } from "../ReportMessageLocalization";

/**
 * The English translation for the `reportMessage` context menu command.
 */
export class ReportMessageENTranslation extends Translation<ReportMessageStrings> {
    override readonly translations: ReportMessageStrings = {
        userNotReportable: "I'm sorry, you cannot report this user.",
        selfReportError: "Hey, you cannot report yourself!",
        reportConfirmation: "Are you sure you want to report this message?",
        reporterDmLocked:
            "%s, your DM is locked, therefore you will not receive your report's summary!",
        goToMessage: "Go to Message",
        offender: "Offender",
        channel: "Channel",
        reason: "Reason",
        reportSummary: "Report Summary",
        saveEvidence: "Remember to save your evidence in case it is needed.",
    };
}
