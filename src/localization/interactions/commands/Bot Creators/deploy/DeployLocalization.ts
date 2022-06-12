import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { DeployENTranslation } from "./translations/DeployENTranslation";
import { DeployESTranslation } from "./translations/DeployESTranslation";
import { DeployIDTranslation } from "./translations/DeployIDTranslation";
import { DeployKRTranslation } from "./translations/DeployKRTranslation";

export interface DeployStrings {
    readonly commandNotFound: string;
    readonly commandDeploySuccessful: string;
}

/**
 * Localizations for the `deploy` command.
 */
export class DeployLocalization extends Localization<DeployStrings> {
    protected override readonly localizations: Readonly<
        Translations<DeployStrings>
    > = {
        en: new DeployENTranslation(),
        kr: new DeployKRTranslation(),
        id: new DeployIDTranslation(),
        es: new DeployESTranslation(),
    };
}
