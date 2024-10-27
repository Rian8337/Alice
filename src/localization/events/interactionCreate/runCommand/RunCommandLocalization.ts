import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { RunCommandENTranslation } from "./translations/RunCommandENTranslation";
import { RunCommandESTranslation } from "./translations/RunCommandESTranslation";
import { RunCommandKRTranslation } from "./translations/RunCommandKRTranslation";

export interface RunCommandStrings {
    readonly debugModeActive: string;
    readonly commandNotFound: string;
    readonly maintenanceMode: string;
    readonly commandNotExecutableInChannel: string;
    readonly requiredPermissions: string;
    readonly commandInCooldown: string;
    readonly commandExecutionFailed: string;
}

/**
 * Localizations for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandLocalization extends Localization<RunCommandStrings> {
    protected override readonly localizations: Readonly<
        Translations<RunCommandStrings>
    > = {
        en: new RunCommandENTranslation(),
        kr: new RunCommandKRTranslation(),
        es: new RunCommandESTranslation(),
    };
}
