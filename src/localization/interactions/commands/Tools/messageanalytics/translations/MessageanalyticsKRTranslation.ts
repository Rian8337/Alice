import { Translation } from "@alice-localization/base/Translation";
import { MessageanalyticsStrings } from "../MessageanalyticsLocalization";

/**
 * The Korean translation for the `messageanalytics` command.
 */
export class MessageanalyticsKRTranslation extends Translation<MessageanalyticsStrings> {
    override readonly translations: MessageanalyticsStrings = {
        incorrectDateFormat: "저기, 알맞은 날짜 형식을 입력해 주세요!",
        dateBeforeGuildCreationError: "저기, 그 때엔 서버가 존재하지 않았어요!",
        dateHasntPassed:
            "혹시.. 미래에 살고 계신건가요? 안타깝게도, 전 아니에요.",
        noActivityDataOnDate: "죄송해요, 해당 날짜에 활동 데이터가 없어요!",
        channelIsFiltered: "죄송해요, 이 채널은 메시지 통계에서 제외됐어요!",
        notATextChannel:
            "죄송해요, 이 명령어는 텍스트 채널에서만 실행할 수 있어요!",
        messageFetchStarted: "성공적으로 메시지 데이터 가져오기를 시작했어요.",
        messageFetchDone: "%s, 메시지 데이터 가져오기가 완료됐어요!",
        messageCount: "메시지 개수",
        wordsCount: "",
        generalChannels: "일반 채널",
        languageChannels: "언어 채널",
        clanChannels: "클랜 채널",
        channelActivity: "%s의 채널 활동",
        overall: "Overall",
        monthly: "Monthly",
        daily: "Daily",
    };
}
