import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CreateSupportTicketWithPresetENTranslation } from "./translations/CreateSupportTicketWithPresetENTranslation";

export interface CreateSupportTicketWithPresetStrings {
    readonly noTicketPresetsExist: string;
    readonly selectPresetPrompt: string;
    readonly presetNotFound: string;
    readonly modalTitle: string;
    readonly modalTitleLabel: string;
    readonly modalTitlePlaceholder: string;
    readonly modalDescriptionLabel: string;
    readonly modalDescriptionPlaceholder: string;
}

/**
 * Localizations for the `createSupportTicketWithPreset` button command.
 */
export class CreateSupportTicketWithPresetLocalization extends Localization<CreateSupportTicketWithPresetStrings> {
    protected override readonly localizations: Readonly<
        Translations<CreateSupportTicketWithPresetStrings>
    > = {
        en: new CreateSupportTicketWithPresetENTranslation(),
    };
}
