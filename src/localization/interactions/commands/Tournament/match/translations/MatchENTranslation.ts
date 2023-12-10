import { Translation } from "@alice-localization/base/Translation";
import { MatchStrings } from "../MatchLocalization";

/**
 * The English translation for the `match` command.
 */
export class MatchENTranslation extends Translation<MatchStrings> {
    override readonly translations: MatchStrings = {
        invalidMatchID: "Hey, please follow the match ID naming convention!",
        matchIDAlreadyTaken:
            "I'm sorry, a match with the same ID already exists!",
        teamPlayerCountDoNotBalance:
            "I'm sorry, the player count difference between both teams must not exceed 1!",
        invalidPlayerInformation:
            "I'm sorry, this player information is not correct: `%s`.",
        invalidChannelToBind:
            "Hey, you can only bind matches in a text channel!",
        matchDoesntExist:
            "I'm sorry, that match doesn't exist or this channel/thread is not bound to a match!",
        matchHasEnded: "I'm sorry, this match has ended!",
        matchHasNoResult: "I'm sorry, this match doesn't have any result yet!",
        mappoolNotFound: "I'm sorry, I cannot find the mappool!",
        mapNotFound:
            "I'm sorry, I cannot find the beatmap that was recently played!",
        playerNotFound: "I'm sorry, I cannot find the profile of uid %s!",
        matchDataInProcess: "Processing match data. Please wait...",
        roundInitiated: "Round initiated!",
        roundCountdownFinished:
            "Beatmap time is over. Beginning 30 seconds countdown.",
        roundEnded: "Round ended!",
        teamPlayerCountDoesntMatch:
            "I'm sorry, your input doesn't match. Team %s has %s player(s). You have only inputted data for %s players.",
        scoreDataInvalid:
            "I'm sorry, the score data for team %s player %s is invalid: %s.",
        addMatchFailed: "I'm sorry, I couldn't add the match: %s.",
        addMatchSuccessful: "Successfully added match `%s`.",
        bindMatchFailed: "I'm sorry, I couldn't bind the match: %s.",
        bindMatchSuccessful:
            "Successfully bound match `%s` to this channel. Please check threads section.",
        endMatchFailed: "I'm sorry, I couldn't end the match: %s.",
        endMatchSuccessful: "Successfully ended match `%s`.",
        removeMatchFailed: "I'm sorry, I couldn't remove the match: %s.",
        removeMatchSuccessful: "Successfully removed match `%s`.",
        undoMatchFailed: "I'm sorry, I couldn't undo the match result: %s.",
        undoMatchSuccessful: "Successfully reverted match `%s`'s result.",
        unbindMatchFailed: "I'm sorry, I couldn't unbind the match: %s.",
        unbindMatchSuccessful: "Successfully unbinded match `%s`.",
        submitMatchFailed: "I'm sorry, I couldn't submit the match result: %s.",
        submitMatchSuccessful: "Successfully updated match result.",
        failed: "Failed",
        none: "None",
        draw: "It's a draw",
        won: "%s won by %s",
        roundInfo: "Round Info",
        matchId: "Match ID",
        map: "Map",
        mapLength: "Map Length",
    };
}
