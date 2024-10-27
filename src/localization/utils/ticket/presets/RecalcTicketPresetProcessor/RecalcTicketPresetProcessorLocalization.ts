import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { RecalcTicketPresetProcessorENTranslation } from "./translations/RecalcTicketPresetProcessorENTranslation";

export interface RecalcTicketPresetProcessorStrings {
    readonly dppBanned: string;
    readonly modalReasonPlaceholder: string;
    readonly modalReasonLabel: string;
}

/**
 * Localizations for the `RecalcTicketPresetProcessor` utility.
 */
export class RecalcTicketPresetProcessorLocalization extends Localization<RecalcTicketPresetProcessorStrings> {
    protected override readonly localizations: Readonly<
        Translations<RecalcTicketPresetProcessorStrings>
    > = {
        en: new RecalcTicketPresetProcessorENTranslation(),
    };
}
