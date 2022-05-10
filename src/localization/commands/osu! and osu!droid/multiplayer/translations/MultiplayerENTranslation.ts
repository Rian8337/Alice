import { Translation } from "@alice-localization/base/Translation";
import { MultiplayerStrings } from "../MultiplayerLocalization";

/**
 * The English translation for the `multiplayer` command.
 */
export class MultiplayerENTranslation extends Translation<MultiplayerStrings> {
    override readonly translations: MultiplayerStrings = {
        roomWithIdDoesntExist:
            "I'm sorry, there is no multiplayer room with that ID!",
        roomDoesntExistInChannel:
            "I'm sorry, there is no multiplayer room in this channel!",
        selfNotInRoom:
            "I'm sorry, you are either not in a multiplayer room or not in this multiplayer room right now!",
        selfInRoom: "I'm sorry, you are in a multiplayer room right now!",
        userNotInRoom:
            "I'm sorry, that user is either not in a multiplayer room or not in your multiplayer room right now!",
        roomInHeadToHeadMode:
            "I'm sorry, this multiplayer room is in head-to-head team mode!",
        roomInTeamVSMode:
            "I'm sorry, this multiplayer room is in team VS team mode!",
        roomHostChangeNotification:
            "The host of the multiplayer room has been changed to %s.",
        cannotKickSelf:
            "Hey, you cannot kick yourself from the multiplayer room!",
        cannotTransferHostToSelf: "Hey, you cannot transfer host to yourself!",
        idTooLong:
            "I'm sorry, multiplayer room IDs can only be up to 20 characters long!",
        nameTooLong:
            "I'm sorry, multiplayer room names can only be up to 100 characters long!",
        wrongPassword: "I'm sorry, you have entered an incorrect password!",
        timerIsSet:
            "I'm sorry, there is already a timer set in this multiplayer room!",
        noTimerSet: "Hey, there is no timer set in this multiplayer room!",
        unrankedModsIncluded: "Hey, there are unranked mods included!",
        speedChangingModsIncluded:
            "Hey, you cannot include speed-changing mods!",
        speedMultiplierNotDivisible:
            "Hey, the given speed multiplier value is not divisible by 0.05!",
        none: "None",
        allowed: "Allowed",
        disallowed: "Disallowed",
        beatmapProvidedIsInvalid: "Hey, please provide a valid beatmap!",
        beatmapNotFound:
            "I'm sorry, I cannot find the beatmap that you are looking for!",
        tooFewPlayers:
            "Hey, there is only you in this multiplayer room! Invite another player!",
        playerNotReady: "Hey, these players are not ready to play yet: %s.",
        noBeatmapPicked:
            "Hey, you haven't picked a beatmap! Please pick a beatmap first!",
        noBeatmapPickedInRoom:
            "I'm sorry, there is currently no picked beatmap in the multiplayer room!",
        roundInfo: "Round Info",
        roundStarted: "Round started!",
        roundCountdownFinished:
            "Beatmap time is over. Beginning 30 seconds countdown.",
        roomIsInPlayingStatus:
            "I'm sorry, this multiplayer room is in playing state!",
        roomIsNotInPlayingStatus:
            "I'm sorry, this multiplayer room is not in playing state!",
        playerIsInReadyState: "I'm sorry, you are currently in ready state!",
        beatmapNotFinished:
            "Hey, 30 seconds haven't passed since the beatmap has finished!",
        scorePortionOutOfRange: "Hey, score portion cannot be 0 or 1!",
        roomIsFull: "I'm sorry, that multiplayer room is full!",
        roomTeamMemberList: "Team Member List",
        redTeam: "Red Team",
        blueTeam: "Blue Team",
        joinRoomNotification: "%s has joined the room.",
        slotHasBeenFilled:
            "I'm sorry, you have more players than what you would be able to fit with that maximum player slot!",
        updateReadyStateFailed:
            "I'm sorry, I couldn't update your ready state: %s.",
        updateReadyStateSuccess:
            "Successfully set your ready state to `%s` (%s/%s).",
        updateSpectatingStateFailed:
            "I'm sorry, I couldn't update your spectating state: %s.",
        updateSpectatingStateSuccess:
            "Successfully set your spectating state to `%s`.",
        updateTeamStateFailed:
            "I'm sorry, I couldn't update your team state: %s.",
        updateTeamStateSuccess: "Successfully set your team to `%s`.",
        playerLeaveFailed:
            "I'm sorry, I couldn't make you leave the multiplayer room: %s.",
        playerLeaveSuccess: "Successfully left the multiplayer room.",
        playerKickFailed:
            "I'm sorry, I couldn't kick the user from the multiplayer room: %s.",
        playerKickSuccess:
            "Successfully kicked the user from the multiplayer room.",
        createRoomFailed:
            "I'm sorry, I couldn't create the multiplayer room: %s.",
        createRoomSuccess: "Successfully created the multiplayer room.",
        joinRoomFailed:
            "I'm sorry, I couldn't make you join the multiplayer room: %s.",
        joinRoomSuccess: "Successfully joined multiplayer room `%s`.",
        timerStopFailed: "I'm sorry, I couldn't abort the ongoing timer: %s.",
        timerStopSuccess: "Successfully aborted the timer.",
        setModsFailed:
            "I'm sorry, I couldn't set required and allowed mods: %s.",
        setModsSuccess:
            "Successfully set required mods to `%s` and allowed mods to `%s`.",
        setRoomNameFailed:
            "I'm sorry, I couldn't set the multiplayer room's name: %s.",
        setRoomNameSuccess:
            "Successfully set the multiplayer room's name to %s.",
        setRoomPasswordFailed:
            "I'm sorry, I couldn't set the multiplayer room's password: %s.",
        setRoomPasswordSuccess:
            "Successfully set the multiplayer room's password to %s.",
        setRoomTeamModeFailed:
            "I'm sorry, I couldn't set the multiplayer room's team mode: %s.",
        setRoomTeamModeSuccess:
            "Successfully set the multiplayer room's team mode to `%s`.",
        setRoomWinConditionFailed:
            "I'm sorry, I couldn't set the multiplayer room's win condition: %s.",
        setRoomWinConditionSuccess:
            "Successfully set the multiplayer room's win condition to `%s`.",
        transferHostFailed: "I'm sorry, I couldn't transfer room host: %s.",
        transferHostSuccess: "Successfully transferred room host to %s.",
        setForceARFailed: "I'm sorry, I couldn't set the force AR rule: %s.",
        setForceARSuccess:
            "Successfully set the force AR rule to `%s (%s min, %s max)`.",
        setSpeedMultiplierFailed:
            "I'm sorry, I couldn't set the required custom speed multiplier: %s.",
        setSpeedMultiplierSuccess:
            "Successfully set the required custom speed multiplier to `%s`.",
        setScorePortionFailed:
            "I'm sorry, I couldn't set the score portion: %s.",
        setScorePortionSuccess: "Successfully set score portion to `%s`.",
        setBeatmapFailed: "I'm sorry, I couldn't set the beatmap: %s.",
        setBeatmapSuccess: "Successfully set current beatmap to `%s`.",
        roundStartFailed: "I'm sorry, I couldn't start the round: %s.",
        roundStartSuccess: "The round will start in %s seconds! Have fun!",
        matchStatusUpdateFailed:
            "I'm sorry, I couldn't update the match status: %s.\n\nPlease use `/multiplayer round forcesubmit` to update the match status.",
        matchStatusUpdateSuccess: "Successfully updated match status.",
        setMaxPlayerSlotFailed:
            "I'm sorry, I couldn't set the multiplayer room's maximum player slots: %s.",
        setMaxPlayerSlotSuccess:
            "Successfully set the multiplayer room's maximum player slots to `%s`.",
    };
}