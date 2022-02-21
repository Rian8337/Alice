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
    };
}
