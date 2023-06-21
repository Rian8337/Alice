import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ReportMessageENTranslation } from "./translations/ReportMessageENTranslation";

export interface ReportMessageStrings {
    readonly userNotReportable: string;
    readonly selfReportError: string;
    readonly reportConfirmation: string;
    readonly reporterDmLocked: string;
    readonly goToMessage: string;
    readonly offender: string;
    readonly channel: string;
    readonly reason: string;
    readonly reportSummary: string;
    readonly saveEvidence: string;
}

/**
 * Localizations for the `reportMessage` context menu command.
 */
export class ReportMessageLocalization extends Localization<ReportMessageStrings> {
    protected override readonly localizations: Readonly<
        Translations<ReportMessageStrings>
    > = {
        en: new ReportMessageENTranslation(),
    };
}
