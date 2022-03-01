import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { VoteENTranslation } from "./translations/VoteENTranslation";
import { VoteIDTranslation } from "./translations/VoteIDTranslation";
import { VoteKRTranslation } from "./translations/VoteKRTranslation";

export interface VoteStrings {
    readonly ongoingVoteInChannel: string;
    readonly noOngoingVoteInChannel: string;
    readonly noEndVotePermission: string;
    readonly endVoteSuccess: string;
    readonly voteChoiceIsSameAsBefore: string;
    readonly notVotedYet: string;
    readonly invalidVoteChoice: string;
    readonly voteRegistered: string;
    readonly voteCancelled: string;
    readonly voteMoved: string;
    readonly tooFewChoices: string;
    readonly voteStartSuccess: string;
    readonly invalidXpReq: string;
    readonly cannotRetrieveTatsuXP: string;
    readonly tatsuXPTooSmall: string;
    readonly topic: string;
}

/**
 * Localizations for the `vote` command.
 */
export class VoteLocalization extends Localization<VoteStrings> {
    protected override readonly localizations: Readonly<
        Translations<VoteStrings>
    > = {
        en: new VoteENTranslation(),
        kr: new VoteKRTranslation(),
        id: new VoteIDTranslation(),
    };
}
