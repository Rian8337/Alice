import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SettingsENTranslation } from "./translations/SettingsENTranslation";
import { SettingsESTranslation } from "./translations/SettingsESTranslation";
import { SettingsKRTranslation } from "./translations/SettingsKRTranslation";

export interface SettingsStrings {
    readonly chosenChannelIsNotText: string;
    readonly setLogChannelSuccess: string;
    readonly unsetLogChannelSuccess: string;
    readonly noLogChannelConfigured: string;
    readonly grantTimeoutImmunitySuccess: string;
    readonly revokeTimeoutImmunitySuccess: string;
    readonly grantTimeoutPermissionSuccess: string;
    readonly revokeTimeoutPermissionSuccess: string;
    readonly invalidTimeoutPermissionDuration: string;
    readonly eventNotFound: string;
    readonly eventUtilityNotFound: string;
    readonly eventUtilityEnableSuccess: string;
    readonly eventUtilityDisableSuccess: string;
    readonly commandNotFound: string;
    readonly cannotDisableCommand: string;
    readonly setCommandCooldownFailed: string;
    readonly setCommandCooldownSuccess: string;
    readonly disableCommandFailed: string;
    readonly disableCommandSuccess: string;
    readonly enableCommandFailed: string;
    readonly enableCommandSuccess: string;
    readonly setGlobalCommandCooldownSuccess: string;
    readonly rolesWithTimeoutImmunity: string;
    readonly rolesWithTimeoutPermission: string;
    readonly eventName: string;
    readonly requiredPermissions: string;
    readonly toggleableScope: string;
    readonly indefinite: string;
}

/**
 * Localizations for the `settings` command.
 */
export class SettingsLocalization extends Localization<SettingsStrings> {
    protected override readonly localizations: Readonly<
        Translations<SettingsStrings>
    > = {
        en: new SettingsENTranslation(),
        kr: new SettingsKRTranslation(),
        es: new SettingsESTranslation(),
    };
}
