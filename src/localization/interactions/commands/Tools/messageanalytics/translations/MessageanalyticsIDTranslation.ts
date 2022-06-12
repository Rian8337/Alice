import { Translation } from "@alice-localization/base/Translation";
import { MessageanalyticsStrings } from "../MessageanalyticsLocalization";

/**
 * The Indonesian translation for the `messageanalytics` command.
 */
export class MessageanalyticsIDTranslation extends Translation<MessageanalyticsStrings> {
    override readonly translations: MessageanalyticsStrings = {
        incorrectDateFormat: "",
        dateBeforeGuildCreationError: "",
        dateHasntPassed: "",
        noActivityDataOnDate: "",
        channelIsFiltered: "",
        wrongServer: "",
        notATextChannel: "",
        messageFetchStarted: "",
        messageFetchDone: "",
        messageCount: "",
        generalChannels: "",
        languageChannels: "",
        clanChannels: "",
        channelActivity: "",
        overall: "",
        monthly: "",
        daily: "",
    };
}
