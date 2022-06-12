import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ReportENTranslation } from "./translations/ReportENTranslation";
import { ReportESTranslation } from "./translations/ReportESTranslation";
import { ReportIDTranslation } from "./translations/ReportIDTranslation";
import { ReportKRTranslation } from "./translations/ReportKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<ReportStrings>
    > = {
        en: new ReportENTranslation(),
        kr: new ReportKRTranslation(),
        id: new ReportIDTranslation(),
        es: new ReportESTranslation(),
    };
}
