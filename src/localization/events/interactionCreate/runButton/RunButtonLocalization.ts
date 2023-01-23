import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { RunButtonENTranslation } from "./translations/RunButtonENTranslation";
import { RunButtonESTranslation } from "./translations/RunButtonESTranslation";
import { RunButtonKRTranslation } from "./translations/RunButtonKRTranslation";

export interface RunButtonStrings {
    readonly debugModeActive: string;
    readonly commandNotFound: string;
    readonly maintenanceMode: string;
    readonly commandInCooldown: string;
    readonly commandExecutionFailed: string;
}

/**
 * Localizations for the `runButton` event utility for `interactionCreate` event.
 */
export class RunButtonLocalization extends Localization<RunButtonStrings> {
    protected override readonly localizations: Readonly<
        Translations<RunButtonStrings>
    > = {
        en: new RunButtonENTranslation(),
        es: new RunButtonESTranslation(),
        kr: new RunButtonKRTranslation(),
    };
}
