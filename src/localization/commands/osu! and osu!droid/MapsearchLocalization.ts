import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MapsearchStrings {
    readonly requestFailed: string;
    readonly noBeatmapsFound: string;
    readonly serviceProvider: string;
    readonly beatmapsFound: string;
    readonly download: string; // see 63.22
}

/**
 * Localizations for the `mapsearch` command.
 */
export class MapsearchLocalization extends Localization<MapsearchStrings> {
    protected override readonly translations: Readonly<
        Translation<MapsearchStrings>
    > = {
        en: {
            requestFailed:
                "I'm sorry, I couldn't fetch your beatmap search result from Sayobot!",
            noBeatmapsFound:
                "I'm sorry, your beatmap search doesn't return any beatmaps!",
            serviceProvider: "Service provided by Sayobot",
            beatmapsFound: "Beatmaps Found",
            download: "Download",
        },
        kr: {
            requestFailed:
                "죄송해요, Sayobot으로부터 비트맵 검색 결과를 가져올 수 없었어요!",
            noBeatmapsFound:
                "죄송해요, 이 비트맵 검색은 아무런 비트맵도 가져올 수 없었어요!",
            serviceProvider: "서비스는 Sayobot에 의해 제공돼요",
            beatmapsFound: "찾은 비트맵:",
            download: "다운로드",
        },
        id: {
            requestFailed: "",
            noBeatmapsFound: "",
            serviceProvider: "",
            beatmapsFound: "",
            download: "",
        },
    };
}
