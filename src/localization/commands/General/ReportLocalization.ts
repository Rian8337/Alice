import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ReportStrings {
    readonly userToReportNotFound: string;
    readonly userNotReportable: string;
    readonly selfReportError: string;
    readonly reporterDmLocked: string;
    readonly offender: string;
    readonly channel: string;
    readonly reason: string;
    readonly reportSummary: string;
    readonly saveEvidence: string;
}

/**
 * Localizations for the `report` command.
 */
export class ReportLocalization extends Localization<ReportStrings> {
    protected override readonly translations: Readonly<
        Translation<ReportStrings>
    > = {
        en: {
            userToReportNotFound: "Hey, please enter a valid user to report!",
            userNotReportable: "I'm sorry, you cannot report this user.",
            selfReportError: "Hey, you cannot report yourself!",
            reporterDmLocked:
                "%s, your DM is locked, therefore you will not receive your report's summary!",
            offender: "Offender",
            channel: "Channel",
            reason: "Reason",
            reportSummary: "Report Summary",
            saveEvidence:
                "Remember to save your evidence in case it is needed.",
        },
    };
}
