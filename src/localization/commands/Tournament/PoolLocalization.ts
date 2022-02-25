import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PoolStrings {
    readonly poolNotFound: string;
    readonly mapNotFound: string;
    readonly length: string;
    readonly beatmapHasNoScores: string;
    readonly topScore: string;
}

/**
 * Localizations for the `pool` command.
 */
export class PoolLocalization extends Localization<PoolStrings> {
    protected override readonly translations: Readonly<
        Translation<PoolStrings>
    > = {
        en: {
            poolNotFound:
                "I'm sorry, I cannot find the mappool that you are looking for!",
            length: "Length",
            mapNotFound: "I'm sorry, I cannot find the beatmap!",
            beatmapHasNoScores:
                "I'm sorry, this beatmap doesn't have any scores submitted!",
            topScore: "Top Score",
        },
        kr: {
            poolNotFound: "죄송해요, 찾으시는 맵풀을 찾을 수 없었어요!",
            length: "길이",
            mapNotFound: "",
            beatmapHasNoScores: "죄송해요, 이 비트맵엔 제출된 기록이 없네요!",
            topScore: "1등 기록",
        },
        id: {
            poolNotFound: "",
            length: "",
            mapNotFound: "",
            beatmapHasNoScores: "",
            topScore: "",
        },
    };
}
