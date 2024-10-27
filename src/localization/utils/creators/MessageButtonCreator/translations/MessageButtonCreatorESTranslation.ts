import { Translation } from "@localization/base/Translation";
import { MessageButtonCreatorStrings } from "../MessageButtonCreatorLocalization";

/**
 * The Spanish translation for the `MessageButtonCreator` creator utility.
 */
export class MessageButtonCreatorESTranslation extends Translation<MessageButtonCreatorStrings> {
    override readonly translations: MessageButtonCreatorStrings = {
        pleaseWait: "Por favor, espere...",
        actionCancelled: "Acción cancelada.",
        timedOut: "Tiempo terminado.",
    };
}
