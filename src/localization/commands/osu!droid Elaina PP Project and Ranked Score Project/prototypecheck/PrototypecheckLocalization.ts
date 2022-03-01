import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PrototypecheckENTranslation } from "./translations/PrototypecheckENTranslation";
import { PrototypecheckIDTranslation } from "./translations/PrototypecheckIDTranslation";
import { PrototypecheckKRTranslation } from "./translations/PrototypecheckKRTranslation";

export interface PrototypecheckStrings {
    readonly tooManyOptions: string;
    readonly selfInfoNotAvailable: string;
    readonly userInfoNotAvailable: string;
    readonly ppProfileTitle: string;
    readonly totalPP: string;
    readonly prevTotalPP: string;
    readonly diff: string;
    readonly ppProfile: string;
    readonly lastUpdate: string;
}

/**
 * Localizations for the `prototypecheck` command.
 */
export class PrototypecheckLocalization extends Localization<PrototypecheckStrings> {
    protected override readonly localizations: Readonly<
        Translations<PrototypecheckStrings>
    > = {
        en: new PrototypecheckENTranslation(),
        kr: new PrototypecheckKRTranslation(),
        id: new PrototypecheckIDTranslation(),
    };
}
