import { Translation } from "@localization/base/Translation";
import { ReportStrings } from "../ReportLocalization";

/**
 * The Korean translation for the `report` command.
 */
export class ReportKRTranslation extends Translation<ReportStrings> {
    override readonly translations: ReportStrings = {
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
    };
}
