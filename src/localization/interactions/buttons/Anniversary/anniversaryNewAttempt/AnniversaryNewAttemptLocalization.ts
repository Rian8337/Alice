import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AnniversaryNewAttemptENTranslation } from "./translations/AnniversaryNewAttemptENTranslation";

export interface AnniversaryNewAttemptStrings {
    readonly existingAttemptExists: string;
    readonly noMoreAttempts: string;
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
