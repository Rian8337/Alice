import { Translation } from "@alice-localization/base/Translation";
import { RunContextMenuStrings } from "../RunContextMenuLocalization";

/**
 * The Indonesian translation for the `runModalSubmit` event utility for `interactionCreate` event.
 */
export class RunContextMenuIDTranslation extends Translation<RunContextMenuStrings> {
    override readonly translations: RunContextMenuStrings = {
        debugModeActive: "",
        commandNotFound: "",
        maintenanceMode: "",
        commandExecutionFailed: "",
    };
}
