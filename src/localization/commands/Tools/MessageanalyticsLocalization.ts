import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MessageanalyticsStrings {
    readonly incorrectDateFormat: string;
    readonly dateBeforeGuildCreationError: string;
    readonly dateHasntPassed: string;
    readonly noActivityDataOnDate: string;
    readonly channelIsFiltered: string;
    readonly wrongServer: string;
    readonly notATextChannel: string;
    readonly messageFetchStarted: string;
    readonly messageFetchDone: string;
    readonly messageCount: string;
    readonly generalChannels: string;
    readonly languageChannels: string;
    readonly clanChannels: string;
    readonly channelActivity: string;
    readonly overall: string;
    readonly monthly: string;
    readonly daily: string;
}

/**
 * Localizations for the `messageanalytics` command.
 */
export class MessageanalyticsLocalization extends Localization<MessageanalyticsStrings> {
    protected override readonly translations: Readonly<Translation<MessageanalyticsStrings>> = {
        en: {
            incorrectDateFormat: "Hey, please enter a correct date format!",
            dateBeforeGuildCreationError: "Hey, the server didn't exist back then!",
            dateHasntPassed: "You're in the future, are you? Unfortunately, I'm not.",
            noActivityDataOnDate: "I'm sorry, there is no activity data on this date!",
            channelIsFiltered: "I'm sorry, this channel is filtered from message analytics!",
            wrongServer: "I'm sorry, this scope can only be used in main server!",
            notATextChannel: "I'm sorry, you can only execute this command in a text channel!",
            messageFetchStarted: "Successfully started message data fetching.",
            messageFetchDone: "%s, message data fetch done!",
            messageCount: "messages",
            generalChannels: "General Channels",
            languageChannels: "Language Channels",
            clanChannels: "Clan Channels",
            channelActivity: "channel activity per %s",
            overall: "Overall",
            monthly: "Monthly",
            daily: "Daily",
        }
    };
}