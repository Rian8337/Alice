import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AnniversaryNewAttemptENTranslation } from "./translations/AnniversaryNewAttemptENTranslation";

export interface AnniversaryNewAttemptStrings {
    readonly existingAttemptExists: string;
}

/**
 * Localizations for the `anniversaryNewAttempt` command.
 */
export class AnniversaryNewAttemptLocalization extends Localization<AnniversaryNewAttemptStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryNewAttemptStrings>
    > = {
        en: new AnniversaryNewAttemptENTranslation(),
    };
}
