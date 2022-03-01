import { Translation } from "@alice-localization/base/Translation";
import { WhitelistStrings } from "../WhitelistLocalization";

/**
 * The Korean translation for the `whitelist` command.
 */
export class WhitelistKRTranslation extends Translation<WhitelistStrings> {
    override readonly translations: WhitelistStrings = {
        noBeatmapProvided: "화이트리스트에 있으며 업데이트됨",
        noBeatmapIDorSetIDFound:
            "죄송해요, 비트맵 ID나 비트맵셋 ID를 찾을 수 없어요!",
        noBeatmapsFound:
            "죄송해요, 제공해 주신 비트맵 ID나 링크로 비트맵을 찾을 수 없었어요!",
        whitelistSuccess: "성공적으로 %s를 화이트리스트에 넣었어요.",
        whitelistFailed: "성공적으로 %s를 화이트리스트에 넣었어요.",
        unwhitelistSuccess: "",
        unwhitelistFailed: "",
        noCachedBeatmapFound:
            "죄송해요, 이 채널에 캐시된 비트맵이 없어요! 비트맵 링크나 ID를 입력해 주세요!",
        beatmapNotFound:
            "죄송해요, 비트맵을 osu! 비트맵 목록에서 찾을 수 없었어요!",
        beatmapDoesntNeedWhitelist:
            "저기, 이 비트맵을 화이트리스트에 넣을 필요가 없어요!",
        whitelistStatus: "%s은 다음 상태에요: %s.",
        whitelistedAndUpdated: "화이트리스트에 있으며 업데이트됨",
        whitelistedNotUpdated: "화이트리스트에 있지만, 업데이트 되지 않음",
        notWhitelisted: "화이트리스트에 없음",
        starRating: "스타 레이팅",
    };
}
