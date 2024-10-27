import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AnniversaryContinueAttemptENTranslation } from "./translations/AnniversaryContinueAttemptENTranslation";

export interface AnniversaryContinueAttemptStrings {
    readonly noExistingAttempt: string;
}

/**
 * Localizations for the `anniversaryContinueAttempt` button command.
 */
export class AnniversaryContinueAttemptLocalization extends Localization<AnniversaryContinueAttemptStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryContinueAttemptStrings>
    > = {
        en: new AnniversaryContinueAttemptENTranslation(),
    };
}
