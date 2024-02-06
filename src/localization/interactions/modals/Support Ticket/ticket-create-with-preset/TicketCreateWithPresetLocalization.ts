import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TicketCreateWithPresetENTranslation } from "./translations/TicketCreateWithPresetENTranslation";

export interface TicketCreateWithPresetStrings {
    readonly presetNotFound: string;
    readonly createTicketFailed: string;
    readonly createTicketSuccess: string;
}

/**
 * Localizations for the `ticket-create-with-preset` modal command.
 */
export class TicketCreateWithPresetLocalization extends Localization<TicketCreateWithPresetStrings> {
    protected override readonly localizations: Readonly<
        Translations<TicketCreateWithPresetStrings>
    > = {
        en: new TicketCreateWithPresetENTranslation(),
    };
}
