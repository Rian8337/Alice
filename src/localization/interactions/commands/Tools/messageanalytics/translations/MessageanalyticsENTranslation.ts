import { Translation } from "@localization/base/Translation";
import { MessageanalyticsStrings } from "../MessageanalyticsLocalization";

/**
 * The English translation for the `messageanalytics` command.
 */
export class MessageanalyticsENTranslation extends Translation<MessageanalyticsStrings> {
    override readonly translations: MessageanalyticsStrings = {
        incorrectDateFormat: "Hey, please enter a correct date format!",
        dateBeforeGuildCreationError: "Hey, the server didn't exist back then!",
        dateHasntPassed:
            "You're in the future, are you? Unfortunately, I'm not.",
        noActivityDataOnDate:
            "I'm sorry, there is no activity data on this date!",
        channelIsFiltered:
            "I'm sorry, this channel is filtered from message analytics!",
        notATextChannel:
            "I'm sorry, you can only execute this command in a text channel!",
        messageFetchStarted: "Successfully started message data fetching.",
        messageFetchDone: "%s, message data fetch done!",
        messageCount: "messages",
        wordsCount: "words",
        generalChannels: "General Channels",
        languageChannels: "Language Channels",
        clanChannels: "Clan Channels",
        channelActivity: "channel activity per %s",
        overall: "Overall",
        monthly: "Monthly",
        daily: "Daily",
    };
}
