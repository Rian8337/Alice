import { Translation } from "@alice-localization/base/Translation";
import { ReportStrings } from "../ReportLocalization";

/**
 * The English translation for the `report` command.
 */
export class ReportENTranslation extends Translation<ReportStrings> {
    override readonly translations: ReportStrings = {
        userToReportNotFound: "Hey, please enter a valid user to report!",
        userNotReportable: "I'm sorry, you cannot report this user.",
        selfReportError: "Hey, you cannot report yourself!",
        reporterDmLocked:
            "%s, your DM is locked, therefore you will not receive your report's summary!",
        offender: "Offender",
        channel: "Channel",
        reason: "Reason",
        reportSummary: "Report Summary",
        saveEvidence: "Remember to save your evidence in case it is needed.",
    };
}
