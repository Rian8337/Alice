import { Translation } from "@localization/base/Translation";
import { MapsearchStrings } from "../MapsearchLocalization";

/**
 * The Korean translation for the `mapsearch` command.
 */
export class MapsearchKRTranslation extends Translation<MapsearchStrings> {
    override readonly translations: MapsearchStrings = {
        requestFailed:
            "죄송해요, Sayobot으로부터 비트맵 검색 결과를 가져올 수 없었어요!",
        noBeatmapsFound:
            "죄송해요, 이 비트맵 검색은 아무런 비트맵도 가져올 수 없었어요!",
        serviceProvider: "서비스는 Sayobot에 의해 제공돼요",
        beatmapsFound: "찾은 비트맵:",
        download: "다운로드",
        lastUpdate: "최근 업데이트",
    };
}
