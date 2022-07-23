import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { RunModalSubmitENTranslation } from "./translations/RunModalSubmitENTranslation";
import { RunModalSubmitESTranslation } from "./translations/RunModalSubmitESTranslation";
import { RunModalSubmitKRTranslation } from "./translations/RunModalSubmitKRTranslation";

export interface RunModalSubmitStrings {
    readonly debugModeActive: string;
    readonly commandNotFound: string;
    readonly maintenanceMode: string;
    readonly commandExecutionFailed: string;
}

/**
 * Localizations for the `runModalSubmit` event utility for `interactionCreate` event.
 */
export class RunModalSubmitLocalization extends Localization<RunModalSubmitStrings> {
    protected override readonly localizations: Readonly<
        Translations<RunModalSubmitStrings>
    > = {
        en: new RunModalSubmitENTranslation(),
        kr: new RunModalSubmitKRTranslation(),
        es: new RunModalSubmitESTranslation(),
    };
}
