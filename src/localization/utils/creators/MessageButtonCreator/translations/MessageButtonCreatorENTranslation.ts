import { Translation } from "@alice-localization/base/Translation";
import { MessageButtonCreatorStrings } from "../MessageButtonCreatorLocalization";

/**
 * The English translation for the `MessageButtonCreator` creator utility.
 */
export class MessageButtonCreatorENTranslation extends Translation<MessageButtonCreatorStrings> {
    override readonly translations: MessageButtonCreatorStrings = {
        pleaseWait: "Please wait...",
        actionCancelled: "Action cancelled.",
        timedOut: "Timed out.",
    };
}
