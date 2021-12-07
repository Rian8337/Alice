/**
 * Strings for the `vote` command.
 */
export enum voteStrings {
    ongoingVoteInChannel = "I'm sorry, there is an ongoing vote in this channel!",
    noOngoingVoteInChannel = "I'm sorry, there is no ongoing vote in this channel!",
    noEndVotePermission = "I'm sorry, you cannot end the ongoing vote! You must be the initiator of it or have the `Manage Channels` permission in the channel!",
    endVoteSuccess = "Vote ended!",
    voteChoiceIsSameAsBefore = "I'm sorry, you have voted for that choice!",
    notVotedYet = "I'm sorry, you have not voted for any option!",
    invalidVoteChoice = "Hey, please enter a valid vote choice!",
    voteRegistered = "%s, %s!",
    tooFewChoices = "I'm sorry, you must specify at least 2 choices!",
    voteStartSuccess = "Successfully started vote.",
    invalidXpReq = "Hey, please enter a valid Tatsu XP requirement!",
    cannotRetrieveTatsuXP = "I'm sorry, I'm unable to retrieve your Tatsu XP status!",
    tatsuXPTooSmall = "I'm sorry, you don't have enough Tatsu XP to participate in this vote!",
}
