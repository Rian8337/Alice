import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface AskcountStrings {
    readonly haveNotAsked: string;
    readonly askCount: string;
}

export class AskcountLocalization extends Localization<AskcountStrings> {
    protected override readonly translations: Readonly<
        Translation<AskcountStrings>
    > = {
        en: {
            haveNotAsked: "I'm sorry, looks like you haven't asked me yet!",
            askCount: "You have asked me %s time(s).",
        },
        kr: {
            haveNotAsked: "죄송해요, 아직 저한테 질문한 적이 없으신 것 같네요!",
            askCount: "저한테 %s번 질문하셨어요.",
        },
        id: {
            haveNotAsked: "Maaf, sepertinya kamu belum pernah bertanya ke aku!",
            askCount: "Kamu telah bertanya kepadaku sebanyak %s kali.",
        },
    };
}
