import { Translation } from "@alice-localization/base/Translation";
import { MapshareStrings } from "../MapshareLocalization";

/**
 * The Korean translation for the `mapshare` command.
 */
export class MapshareKRTranslation extends Translation<MapshareStrings> {
    override readonly translations: MapshareStrings = {
        noSubmissionWithStatus: "죄송해요, 현재 %s 상태의 제출이 없어요!",
        noBeatmapFound: "저기, 유효한 비트맵 ID나 링크를 입력해 주세요!",
        beatmapIsOutdated:
            "죄송해요, 비트맵이 제출 이후에 업데이트 되었어요! 제출이 자동으로 삭제됐어요.",
        noSubmissionWithBeatmap: "죄송해요, 이 비트맵은 제출 기록이 없어요!",
        submissionIsNotPending: "죄송해요, 이 제출은 %s 상태가 아니에요!",
        userIsAlreadyBanned:
            "죄송해요, 이 유저는 이미 맵 공유 제출을 금지당했어요!",
        userIsNotBanned:
            "죄송해요, 이 유저는 맵 공유 제출을 금지당하지 않았어요!",
        denyFailed: "죄송해요, 제출을 거부할 수 없었어요: %s.",
        denySuccess: "성공적으로 제출을 거부했어요.",
        acceptFailed: "죄송해요, 제출을 수락할 수 없었어요: %s.",
        acceptSuccess: "성공적으로 제출을 수락했어요.",
        banFailed: "죄송해요, 이 유저의 맵 공유 제출을 금지할 수 없었어요: %s.",
        banSuccess: "성공적으로 이 유저의 맵 공유 제출을 금지했어요.",
        unbanFailed:
            "죄송해요, 이 유저의 맵 공유 제출 금지를 해제할 수 없었어요: %s.",
        unbanSuccess: "성공적으로 이 유저의 맵 공유 제출 금지를 해제했어요.",
        postFailed: "죄송해요, 제출을 포스팅 할 수 없었어요: %s.",
        postSuccess: "성공적으로 제출을 포스팅했어요.",
        statusAccepted: "수락됨",
        statusDenied: "거부됨",
        statusPending: "처리중",
        statusPosted: "포스트됨",
        submissionStatusList: "%s 상태인 제출",
        submissionFromUser: "%s의 제출",
        userId: "유저 ID",
        beatmapId: "비트맵 ID",
        beatmapLink: "비트맵 링크",
        creationDate: "만들어진 날짜",
        submitModalTitle: "",
        submitModalBeatmapLabel: "",
        submitModalBeatmapPlaceholder: "",
        submitModalSummaryLabel: "",
        submitModalSummaryPlaceholder: "",
    };
}
