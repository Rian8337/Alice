/**
 * Strings for the `vote` command.
 */
export enum voteStrings {
    noOngoingVoteInChannel = "I'm sorry, there is no ongoing vote in this channel!",
    noEndVotePermission = "I'm sorry, you cannot end the ongoing vote! You must be the initiator of it or have the `Manage Channels` permission in the channel!",
    endVoteSuccess = "Vote ended!",
    voteChoiceIsSameAsBefore = "I'm sorry, you have voted for that choice!",
    voteRegistered = "%s, %s!",
    tooFewChoices = "I'm sorry, you must specify at least 2 choices!",
    voteStartSuccess = "Successfully started vote.",
}
