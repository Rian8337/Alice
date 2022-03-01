import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { NameChangeENTranslation } from "./translations/NameChangeENTranslation";
import { NameChangeIDTranslation } from "./translations/NameChangeIDTranslation";
import { NameChangeKRTranslation } from "./translations/NameChangeKRTranslation";

export interface NameChangeStrings {
    readonly requestNotActive: string;
    readonly playerNotFound: string;
    readonly droidServerRequestFailed: string;
    readonly newUsernameTaken: string;
    readonly requestDetails: string;
    readonly currentUsername: string;
    readonly requestedUsername: string;
    readonly creationDate: string;
    readonly status: string;
    readonly accepted: string;
    readonly acceptedNotification: string;
    readonly denied: string;
    readonly reason: string;
    readonly deniedNotification: string;
}

/**
 * Localizations for the `NameChange` database utility.
 */
export class NameChangeLocalization extends Localization<NameChangeStrings> {
    protected override readonly localizations: Readonly<
        Translations<NameChangeStrings>
    > = {
        en: new NameChangeENTranslation(),
        kr: new NameChangeKRTranslation(),
        id: new NameChangeIDTranslation(),
    };
}
