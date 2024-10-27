import { Translation } from "@localization/base/Translation";
import { BlacklistStrings } from "../BlacklistLocalization";

/**
 * The Korean translation of the `blacklist` command.
 */
export class BlacklistKRTranslation extends Translation<BlacklistStrings> {
    override readonly translations: BlacklistStrings = {
        noBeatmapProvided:
            "저기, 블랙리스트에 추가하거나 블랙리스트에서 제거할 비트맵을 입력해 주세요!",
        beatmapNotFound: "저기, 제공된 링크나 ID로 비트맵을 찾지 못했어요!",
        noBlacklistReasonProvided:
            "저기, 비트맵을 블랙리스트에 올리는 이유를 입력해 주세요!",
        blacklistFailed:
            "죄송해요, 비트맵을 블랙리스트에 올릴 수 없엇어요: `%s`.",
        blacklistSuccess: "성공적으로 `%s`을(를) 블랙리스트에 올렸어요.",
        unblacklistFailed:
            "죄송해요, 비트맵을 블랙리스트에서 제거할 수 없었어요: `%s`.",
        unblacklistSuccess: "성공적으로 `%s`을(를) 블랙리스트에서 제거했어요.",
        detectedBeatmapId: "감지된 비트맵 ID: %s. 원하는 행동을 선택해 주세요.",
        blacklist: "블랙리스트",
        blacklistAction: "비트맵을 블랙리스트에 넣어요.",
        unblacklist: "언블랙리스트",
        unblacklistAction: "비트맵을 블랙리스트에서 제거해요.",
    };
}
