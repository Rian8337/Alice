import { Translation } from "@alice-localization/base/Translation";
import { RunModalSubmitStrings } from "../RunModalSubmitLocalization";

/**
 * The Indonesian translation for the `runModalSubmit` event utility for `interactionCreate` event.
 */
export class RunModalSubmitIDTranslation extends Translation<RunModalSubmitStrings> {
    override readonly translations: RunModalSubmitStrings = {
        debugModeActive: "",
        commandNotFound: "",
        maintenanceMode: "",
        commandExecutionFailed: "",
    };
}
