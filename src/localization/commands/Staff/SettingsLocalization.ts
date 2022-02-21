import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

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
    protected override readonly translations: Readonly<Translation<SettingsStrings>> = {
        en: {
            chosenChannelIsNotText: "Hey, please choose a text channel!",
            setLogChannelSuccess: "Successfully set your guild's punishment log channel to %s.",
            unsetLogChannelSuccess: "Successfully unset your guild's punishment log channel.",
            noLogChannelConfigured: "I'm sorry, this server doesn't have a punishment log channel configured! Please set a punishment log channel first!",
            grantTimeoutImmunitySuccess: "Successfully granted timeout immunity for %s role.",
            revokeTimeoutImmunitySuccess: "Successfully revoked timeout immunity for %s role.",
            grantTimeoutPermissionSuccess: "Successfully granted timeout permission for %s role.",
            revokeTimeoutPermissionSuccess: "Successfully revoked timeout permission for %s role.",
            invalidTimeoutPermissionDuration: "Hey, please enter a proper maximum timeout duration!",
            eventNotFound: "I'm sorry, I cannot find the event that you have specified!",
            eventUtilityNotFound: "I'm sorry, I cannot find the event utility that you have specified!",
            eventUtilityEnableSuccess: "Successfully enabled event utility `%s` for event `%s`.",
            eventUtilityDisableSuccess: "Successfully disabled event utility `%s` for event `%s`.",
            commandNotFound: "I'm sorry, I cannot find the command that you have specified!",
            cannotDisableCommand: "I'm sorry, you cannot disable or put a cooldown to this command!",
            setCommandCooldownFailed: "I'm sorry, I'm unable to set the command's cooldown: %s.",
            setCommandCooldownSuccess: "Successfully set `%s` cooldown to %s second(s).",
            disableCommandFailed: "I'm sorry, I'm unable to disable the command: %s.",
            disableCommandSuccess: "Successfully disabled `%s` command.",
            enableCommandFailed: "I'm sorry, I'm unable to enable the command: %s.",
            enableCommandSuccess: "Successfully enabled `%s` command.",
            setGlobalCommandCooldownSuccess: "Successfully set global command cooldown to `%s` second(s).",
            rolesWithTimeoutImmunity: "Roles with Timeout Immunity",
            rolesWithTimeoutPermission: "Roles with Timeout Permission",
            eventName: "Event name",
            requiredPermissions: "Required Permissions",
            toggleableScope: "Toggleable Scope",
            indefinite: "Indefinite",
        }
    };
}