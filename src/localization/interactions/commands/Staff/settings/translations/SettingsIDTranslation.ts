import { Translation } from "@alice-localization/base/Translation";
import { SettingsStrings } from "../SettingsLocalization";

/**
 * The Indonesian translation for the `settings` command.
 */
export class SettingsIDTranslation extends Translation<SettingsStrings> {
    override readonly translations: SettingsStrings = {
        chosenChannelIsNotText: "",
        setLogChannelSuccess: "",
        unsetLogChannelSuccess: "",
        noLogChannelConfigured: "",
        grantTimeoutImmunitySuccess: "",
        revokeTimeoutImmunitySuccess: "",
        grantTimeoutPermissionSuccess: "",
        revokeTimeoutPermissionSuccess: "",
        invalidTimeoutPermissionDuration: "",
        eventNotFound: "",
        eventUtilityNotFound: "",
        eventUtilityEnableSuccess: "",
        eventUtilityDisableSuccess: "",
        commandNotFound: "",
        cannotDisableCommand: "",
        setCommandCooldownFailed: "",
        setCommandCooldownSuccess: "",
        disableCommandFailed: "",
        disableCommandSuccess: "",
        enableCommandFailed: "",
        enableCommandSuccess: "",
        setGlobalCommandCooldownSuccess: "",
        rolesWithTimeoutImmunity: "",
        rolesWithTimeoutPermission: "",
        eventName: "",
        requiredPermissions: "",
        toggleableScope: "",
        indefinite: "",
    };
}
