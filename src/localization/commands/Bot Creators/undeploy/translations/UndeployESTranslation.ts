import { Translation } from "@alice-localization/base/Translation";
import { UndeployStrings } from "../UndeployLocalization";

/**
 * The Spanish translation for the `undeploy` command.
 */
export class UndeployESTranslation extends Translation<UndeployStrings> {
    override readonly translations: UndeployStrings = {
        commandNotFound:
            "Lo siento! No puedo encontrar ningun comando con ese nombre.",
        commandUndeploySuccessful: "Comando %s eliminado correctamente.",
    };
}
