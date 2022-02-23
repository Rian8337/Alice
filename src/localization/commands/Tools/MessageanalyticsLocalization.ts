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
    protected override readonly translations: Readonly<
        Translation<MessageanalyticsStrings>
    > = {
        en: {
            incorrectDateFormat: "Hey, please enter a correct date format!",
            dateBeforeGuildCreationError:
                "Hey, the server didn't exist back then!",
            dateHasntPassed:
                "You're in the future, are you? Unfortunately, I'm not.",
            noActivityDataOnDate:
                "I'm sorry, there is no activity data on this date!",
            channelIsFiltered:
                "I'm sorry, this channel is filtered from message analytics!",
            wrongServer:
                "I'm sorry, this scope can only be used in main server!",
            notATextChannel:
                "I'm sorry, you can only execute this command in a text channel!",
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
        },
        kr: {
            incorrectDateFormat: "저기, 알맞은 날짜 형식을 입력해 주세요!",
            dateBeforeGuildCreationError:
                "저기, 그 때엔 서버가 존재하지 않았어요!",
            dateHasntPassed:
                "혹시.. 미래에 살고 계신건가요? 안타깝게도, 전 아니에요.",
            noActivityDataOnDate: "죄송해요, 해당 날짜에 활동 데이터가 없어요!",
            channelIsFiltered:
                "죄송해요, 이 채널은 메시지 통계에서 제외됐어요!",
            wrongServer:
                "죄송해요, 이 범위(scope)는 메인 서버에서만 사용할 수 있어요!",
            notATextChannel:
                "죄송해요, 이 명령어는 텍스트 채널에서만 실행할 수 있어요!",
            messageFetchStarted:
                "성공적으로 메시지 데이터 가져오기를 시작했어요.",
            messageFetchDone: "%s, 메시지 데이터 가져오기가 완료됐어요!",
            messageCount: "메시지 개수",
            generalChannels: "일반 채널",
            languageChannels: "언어 채널",
            clanChannels: "클랜 채널",
            channelActivity: "%s의 채널 활동",
            overall: "",
            monthly: "",
            daily: "",
        },
        id: {
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
        },
    };
}
