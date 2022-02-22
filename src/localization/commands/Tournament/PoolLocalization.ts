import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PoolStrings {
    readonly poolNotFound: string;
    readonly length: string;
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
        },
        kr: {
            poolNotFound: "죄송해요, 찾으시는 맵풀을 찾을 수 없었어요!",
            length: "길이",
        },
    };
}
