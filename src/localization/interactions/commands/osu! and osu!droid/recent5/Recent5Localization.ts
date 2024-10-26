import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { Recent5ENTranslation } from "./translations/Recent5ENTranslation";
import { Recent5ESTranslation } from "./translations/Recent5ESTranslation";
import { Recent5IDTranslation } from "./translations/Recent5IDTranslation";
import { Recent5KRTranslation } from "./translations/Recent5KRTranslation";

export interface Recent5Strings {
    readonly tooManyOptions: string;
    readonly playerNotFound: string;
    readonly playerHasNoRecentPlays: string;
}

/**
 * Localizations for the `recent5` command.
 */
export class Recent5Localization extends Localization<Recent5Strings> {
    protected override readonly localizations: Readonly<
        Translations<Recent5Strings>
    > = {
        en: new Recent5ENTranslation(),
        kr: new Recent5KRTranslation(),
        id: new Recent5IDTranslation(),
        es: new Recent5ESTranslation(),
    };
}
