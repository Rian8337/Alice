import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PPcheckStrings {
    readonly tooManyOptions: string;
}

/**
 * Localizations for `ppcheck` command.
 */
export class PPcheckLocalization extends Localization<PPcheckStrings> {
    protected override readonly translations: Readonly<
        Translation<PPcheckStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        },
        kr: {
            tooManyOptions:
                "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        },
        id: {
            tooManyOptions: "",
        },
    };
}
