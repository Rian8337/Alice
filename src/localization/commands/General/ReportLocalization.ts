import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ReportStrings {
    readonly userToReportNotFound: string;
    readonly userNotReportable: string;
    readonly selfReportError: string;
    readonly reporterDmLocked: string;
    readonly offender: string;
    readonly channel: string;
    readonly reason: string;
    readonly reportSummary: string;
    readonly saveEvidence: string;
}

/**
 * Localizations for the `report` command.
 */
export class ReportLocalization extends Localization<ReportStrings> {
    protected override readonly translations: Readonly<
        Translation<ReportStrings>
    > = {
        en: {
            userToReportNotFound: "Hey, please enter a valid user to report!",
            userNotReportable: "I'm sorry, you cannot report this user.",
            selfReportError: "Hey, you cannot report yourself!",
            reporterDmLocked:
                "%s, your DM is locked, therefore you will not receive your report's summary!",
            offender: "Offender",
            channel: "Channel",
            reason: "Reason",
            reportSummary: "Report Summary",
            saveEvidence:
                "Remember to save your evidence in case it is needed.",
        },
        kr: {
            userToReportNotFound: "저기, 신고할 유효한 유저를 입력해 주세요!",
            userNotReportable: "죄송해요, 당신은 이 유저를 신고할 수 없어요.",
            selfReportError: "저기, 자기 자신을 신고할 수는 없어요!",
            reporterDmLocked:
                "%s, 당신의 DM이 잠겨있어서 신고에 관한 정보를 받을 수 없을거에요!",
            offender: "신고 대상",
            channel: "채널",
            reason: "이유",
            reportSummary: "신고 요약",
            saveEvidence: "필요할 경우 증거를 저장해 놓는 걸 잊지 마세요.",
        },
    };
}
