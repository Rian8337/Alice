import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PingENTranslation } from "./translations/PingENTranslation";
import { PingESTranslation } from "./translations/PingESTranslation";
import { PingIDTranslation } from "./translations/PingIDTranslation";
import { PingKRTranslation } from "./translations/PingKRTranslation";

export interface PingStrings {
    readonly pong: string;
    readonly discordWs: string;
    readonly droidServer: string;
    readonly elainaDb: string;
    readonly aliceDb: string;
}

/**
 * Localizations for the `ping` command.
 */
export class PingLocalization extends Localization<PingStrings> {
    protected override readonly localizations: Readonly<
        Translations<PingStrings>
    > = {
        en: new PingENTranslation(),
        kr: new PingKRTranslation(),
        id: new PingIDTranslation(),
        es: new PingESTranslation(),
    };
}
