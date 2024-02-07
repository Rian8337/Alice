import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketGuidePurposeENTranslation } from "./translations/SupportTicketGuidePurposeENTranslation";

export interface SupportTicketGuidePurposeStrings {
    readonly embedTitle: string;
    readonly supportTicketMainPurpose: string;
    readonly supportTicketConstraint: string;
}

/**
 * Localizations for the `supportTicketGuidePurpose` button command.
 */
export class SupportTicketGuidePurposeLocalization extends Localization<SupportTicketGuidePurposeStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketGuidePurposeStrings>
    > = {
        en: new SupportTicketGuidePurposeENTranslation(),
    };
}
