import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MultiplayerENTranslation } from "./translations/MultiplayerENTranslation";
import { MultiplayerESTranslation } from "./translations/MultiplayerESTranslation";
import { MultiplayerIDTranslation } from "./translations/MultiplayerIDTranslation";
import { MultiplayerKRTranslation } from "./translations/MultiplayerKRTranslation";

export interface MultiplayerStrings {
    readonly about: string;
    readonly roomWithIdDoesntExist: string;
    readonly roomWithIdAlreadyExists: string;
    readonly roomDoesntExistInChannel: string;
    readonly selfNotInRoom: string;
    readonly selfInRoom: string;
    readonly userNotInRoom: string;
    readonly roomInHeadToHeadMode: string;
    readonly roomInTeamVSMode: string;
    readonly roomHostChangeNotification: string;
    readonly cannotKickSelf: string;
    readonly cannotTransferHostToSelf: string;
    readonly idTooLong: string;
    readonly nameTooLong: string;
    readonly wrongPassword: string;
    readonly timerIsSet: string;
    readonly noTimerSet: string;
    readonly unrankedModsIncluded: string;
    readonly speedChangingModsIncluded: string;
    readonly speedMultiplierNotDivisible: string;
    readonly none: string;
    readonly allowed: string;
    readonly disallowed: string;
    readonly beatmapProvidedIsInvalid: string;
    readonly beatmapNotFound: string;
    readonly tooFewPlayers: string;
    readonly playerNotReady: string;
    readonly noBeatmapPicked: string;
    readonly noBeatmapPickedInRoom: string;
    readonly roundInfo: string;
    readonly roundStarted: string;
    readonly roundCountdownStatus: string;
    readonly roundCountdownFinished: string;
    readonly roomIsInPlayingStatus: string;
    readonly roomIsNotInPlayingStatus: string;
    readonly playerIsInReadyState: string;
    readonly beatmapNotFinished: string;
    readonly scorePortionOutOfRange: string;
    readonly scorev1Value: string;
    readonly scorev2Value: string;
    readonly roomIsFull: string;
    readonly roomTeamMemberList: string;
    readonly redTeam: string;
    readonly blueTeam: string;
    readonly joinRoomNotification: string;
    readonly slotHasBeenFilled: string;
    readonly noModsDetected: string;
    readonly pickWinCondition: string;
    readonly pickTeamMode: string;
    readonly closeRoomAttempt: string;
    readonly updateReadyStateFailed: string;
    readonly updateReadyStateSuccess: string;
    readonly updateSpectatingStateFailed: string;
    readonly updateSpectatingStateSuccess: string;
    readonly updateTeamStateFailed: string;
    readonly updateTeamStateSuccess: string;
    readonly playerLeaveFailed: string;
    readonly playerLeaveSuccess: string;
    readonly playerKickFailed: string;
    readonly playerKickSuccess: string;
    readonly createRoomFailed: string;
    readonly createRoomSuccess: string;
    readonly joinRoomFailed: string;
    readonly joinRoomSuccess: string;
    readonly timerStopFailed: string;
    readonly timerStopSuccess: string;
    readonly setModsFailed: string;
    readonly setModsSuccess: string;
    readonly setRoomNameFailed: string;
    readonly setRoomNameSuccess: string;
    readonly setRoomPasswordFailed: string;
    readonly setRoomPasswordSuccess: string;
    readonly setRoomTeamModeFailed: string;
    readonly setRoomTeamModeSuccess: string;
    readonly setRoomWinConditionFailed: string;
    readonly setRoomWinConditionSuccess: string;
    readonly transferHostFailed: string;
    readonly transferHostSuccess: string;
    readonly setForceARFailed: string;
    readonly setForceARSuccess: string;
    readonly setSpeedMultiplierFailed: string;
    readonly setSpeedMultiplierSuccess: string;
    readonly setScorePortionFailed: string;
    readonly setScorePortionSuccess: string;
    readonly setBeatmapFailed: string;
    readonly setBeatmapSuccess: string;
    readonly roundStartFailed: string;
    readonly roundStartSuccess: string;
    readonly matchStatusUpdateFailed: string;
    readonly matchStatusUpdateSuccess: string;
    readonly setMaxPlayerSlotFailed: string;
    readonly setMaxPlayerSlotSuccess: string;
    readonly setAllowSliderLockFailed: string;
    readonly setAllowSliderLockSuccess: string;
    readonly setModMultiplierFailed: string;
    readonly setModMultiplierSuccess: string;
    readonly teamSelectFailed: string;
    readonly teamSelectSuccess: string;
    readonly multiplayerRoomPrefix: string;
    readonly roomHost: string;
    readonly playerDiscordAccount: string;
    readonly playerState: string;
    readonly ready: string;
    readonly notReady: string;
    readonly spectating: string;
    readonly default: string;
    readonly winConditionScoreV1: string;
    readonly winConditionAccuracy: string;
    readonly winConditionMaxCombo: string;
    readonly winConditionScoreV2: string;
    readonly winConditionMost300s: string;
    readonly winConditionLeast100s: string;
    readonly winConditionLeast50s: string;
    readonly winConditionLeastMisses: string;
    readonly winConditionLeastUnstableRate: string;
    readonly winConditionMostDroidPp: string;
    readonly winConditionMostPcPp: string;
    readonly teamModeHeadToHead: string;
    readonly teamModeTeamVS: string;
}

/**
 * Localizations for the `multiplayer` command.
 */
export class MultiplayerLocalization extends Localization<MultiplayerStrings> {
    protected override readonly localizations: Readonly<
        Translations<MultiplayerStrings>
    > = {
        en: new MultiplayerENTranslation(),
        es: new MultiplayerESTranslation(),
        kr: new MultiplayerKRTranslation(),
        id: new MultiplayerIDTranslation(),
    };
}
