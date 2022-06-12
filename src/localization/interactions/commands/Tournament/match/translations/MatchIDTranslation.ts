import { Translation } from "@alice-localization/base/Translation";
import { MatchStrings } from "../MatchLocalization";

/**
 * The Indonesian translation for the `match` command.
 */
export class MatchIDTranslation extends Translation<MatchStrings> {
    override readonly translations: MatchStrings = {
        invalidMatchID: "",
        matchIDAlreadyTaken: "",
        teamPlayerCountDoNotBalance: "",
        invalidPlayerInformation: "",
        invalidChannelToBind: "",
        matchDoesntExist: "",
        matchHasEnded: "",
        matchHasNoResult: "",
        mappoolNotFound: "",
        mapNotFound: "",
        playerNotFound: "",
        matchDataInProcess: "",
        roundInitiated: "",
        roundCountdownFinished: "",
        roundEnded: "",
        teamPlayerCountDoesntMatch: "",
        scoreDataInvalid: "",
        addMatchFailed: "",
        addMatchSuccessful: "",
        bindMatchFailed: "",
        bindMatchSuccessful: "",
        endMatchFailed: "",
        endMatchSuccessful: "",
        removeMatchFailed: "",
        removeMatchSuccessful: "",
        undoMatchFailed: "",
        undoMatchSuccessful: "",
        unbindMatchFailed: "",
        unbindMatchSuccessful: "",
        submitMatchFailed: "",
        submitMatchSuccessful: "",
        failed: "",
        none: "",
        draw: "",
        won: "",
        roundInfo: "",
        matchId: "",
        map: "",
        mapLength: "",
    };
}
