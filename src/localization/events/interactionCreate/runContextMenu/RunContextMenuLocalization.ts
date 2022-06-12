import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { RunContextMenuENTranslation } from "./translations/RunContextMenuENTranslation";
import { RunContextMenuESTranslation } from "./translations/RunContextMenuESTranslation";
import { RunContextMenuIDTranslation } from "./translations/RunContextMenuIDTranslation";
import { RunContextMenuKRTranslation } from "./translations/RunContextMenuKRTranslation";

export interface RunContextMenuStrings {
    readonly debugModeActive: string;
    readonly commandNotFound: string;
    readonly maintenanceMode: string;
    readonly commandExecutionFailed: string;
}

/**
 * Localizations for the `runContextMenu` event utility for `interactionCreate` event.
 */
export class RunContextMenuLocalization extends Localization<RunContextMenuStrings> {
    protected override readonly localizations: Readonly<
        Translations<RunContextMenuStrings>
    > = {
        en: new RunContextMenuENTranslation(),
        es: new RunContextMenuESTranslation(),
        id: new RunContextMenuIDTranslation(),
        kr: new RunContextMenuKRTranslation(),
    };
}
