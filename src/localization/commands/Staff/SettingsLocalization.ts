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
    protected override readonly translations: Readonly<
        Translation<SettingsStrings>
    > = {
        en: {
            chosenChannelIsNotText: "Hey, please choose a text channel!",
            setLogChannelSuccess:
                "Successfully set your guild's punishment log channel to %s.",
            unsetLogChannelSuccess:
                "Successfully unset your guild's punishment log channel.",
            noLogChannelConfigured:
                "I'm sorry, this server doesn't have a punishment log channel configured! Please set a punishment log channel first!",
            grantTimeoutImmunitySuccess:
                "Successfully granted timeout immunity for %s role.",
            revokeTimeoutImmunitySuccess:
                "Successfully revoked timeout immunity for %s role.",
            grantTimeoutPermissionSuccess:
                "Successfully granted timeout permission for %s role.",
            revokeTimeoutPermissionSuccess:
                "Successfully revoked timeout permission for %s role.",
            invalidTimeoutPermissionDuration:
                "Hey, please enter a proper maximum timeout duration!",
            eventNotFound:
                "I'm sorry, I cannot find the event that you have specified!",
            eventUtilityNotFound:
                "I'm sorry, I cannot find the event utility that you have specified!",
            eventUtilityEnableSuccess:
                "Successfully enabled event utility `%s` for event `%s`.",
            eventUtilityDisableSuccess:
                "Successfully disabled event utility `%s` for event `%s`.",
            commandNotFound:
                "I'm sorry, I cannot find the command that you have specified!",
            cannotDisableCommand:
                "I'm sorry, you cannot disable or put a cooldown to this command!",
            setCommandCooldownFailed:
                "I'm sorry, I'm unable to set the command's cooldown: %s.",
            setCommandCooldownSuccess:
                "Successfully set `%s` cooldown to %s second(s).",
            disableCommandFailed:
                "I'm sorry, I'm unable to disable the command: %s.",
            disableCommandSuccess: "Successfully disabled `%s` command.",
            enableCommandFailed:
                "I'm sorry, I'm unable to enable the command: %s.",
            enableCommandSuccess: "Successfully enabled `%s` command.",
            setGlobalCommandCooldownSuccess:
                "Successfully set global command cooldown to `%s` second(s).",
            rolesWithTimeoutImmunity: "Roles with Timeout Immunity",
            rolesWithTimeoutPermission: "Roles with Timeout Permission",
            eventName: "Event name",
            requiredPermissions: "Required Permissions",
            toggleableScope: "Toggleable Scope",
            indefinite: "Indefinite",
        },
        kr: {
            chosenChannelIsNotText: "저기, 텍스트 채널을 선택해 주세요!",
            setLogChannelSuccess:
                "성공적으로 당신 길드의 처벌 로그 채널을 %s로 설정했어요.",
            unsetLogChannelSuccess:
                "성공적으로 당신 길드의 처벌 로그 채널을 설정 해제했어요.",
            noLogChannelConfigured:
                "죄송해요, 이 서버는 정해진 처벌 로그 채널이 없어요! 먼저 처벌 로그 채널을 설정해 주세요!",
            grantTimeoutImmunitySuccess:
                "성공적으로 %s 역할을 타임아웃 면역으로 설정했어요.",
            revokeTimeoutImmunitySuccess:
                "성공적으로 %s 역할의 타임아웃 면역을 해제했어요.",
            grantTimeoutPermissionSuccess:
                "성공적으로 %s 역할에 타임아웃 권한을 부여했어요.",
            revokeTimeoutPermissionSuccess:
                "성공적으로 %s 역할의 타임아웃 권한을 제거했어요.",
            invalidTimeoutPermissionDuration:
                "저기, 해당 역할이 부여할 수 있는 타임아웃 최대 지속시간을 지정해 주세요!",
            eventNotFound: "죄송해요, 지정하신 이벤트를 찾지 못했어요!",
            eventUtilityNotFound:
                "죄송해요, 지정하신 이벤트 유틸리티를 찾지 못했어요!",
            eventUtilityEnableSuccess:
                "성공적으로 이벤트 유틸리티 %s를 %s 이벤트에 활성화했어요.",
            eventUtilityDisableSuccess:
                "성공적으로 이벤트 유틸리티 %s를 %s 이벤트에 비활성화했어요.",
            commandNotFound: "죄송해요, 지정하신 명령어를 찾지 못했어요!",
            cannotDisableCommand:
                "죄송해요, 이 명령어는 비활성화하거나 쿨타임을 부여할 수 없어요!",
            setCommandCooldownFailed:
                "죄송해요, 명령어의 쿨타임을 설정할 수 없었어요: %s.",
            setCommandCooldownSuccess:
                "성공적으로 %s 쿨타임을 %s초로 설정했어요.",
            disableCommandFailed:
                "죄송해요, 명령어를 비활성화 할 수 없었어요: %s.",
            disableCommandSuccess: "성공적으로 %s 명령어를 비활성화했어요.",
            enableCommandFailed:
                "죄송해요, 명령어를 활성화 할 수 없었어요: %s.",
            enableCommandSuccess: "성공적으로 %s 명령어를 활성화했어요.",
            setGlobalCommandCooldownSuccess:
                "성공적으로 명령어의 글로벌 쿨타임을 %s초로 설정했어요.",
            rolesWithTimeoutImmunity: "타임아웃에 면역인 역할",
            rolesWithTimeoutPermission: "타임아웃 권한을 가진 역할",
            eventName: "이벤트명",
            requiredPermissions: "필요 권한",
            toggleableScope: "토글 가능 범위",
            indefinite: "",
        },
    };
}
