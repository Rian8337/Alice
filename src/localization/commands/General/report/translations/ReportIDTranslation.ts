import { Translation } from "@alice-localization/base/Translation";
import { ReportStrings } from "../ReportLocalization";

/**
 * The Indonesian translation for the `report` command.
 */
export class ReportIDTranslation extends Translation<ReportStrings> {
    override readonly translations: ReportStrings = {
        userToReportNotFound: "",
        userNotReportable: "",
        selfReportError: "",
        reporterDmLocked: "",
        offender: "",
        channel: "",
        reason: "",
        reportSummary: "",
        saveEvidence: "",
    };
}
