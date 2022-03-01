import { Translation } from "@alice-localization/base/Translation";
import { MessageButtonCreatorStrings } from "../MessageButtonCreatorLocalization";

/**
 * The Indonesian translation for the `MessageButtonCreator` creator utility.
 */
export class MessageButtonCreatorIDTranslation extends Translation<MessageButtonCreatorStrings> {
    override readonly translations: MessageButtonCreatorStrings = {
        pleaseWait: "",
        actionCancelled: "",
        timedOut: "",
    };
}
