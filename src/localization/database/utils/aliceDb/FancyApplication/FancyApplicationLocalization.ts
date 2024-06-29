import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { FancyApplicationENTranslation } from "./translations/FancyApplicationENTranslation";

export interface FancyApplicationStrings {
    readonly voteNotStarted: string;
    readonly voteHasFinished: string;
    readonly channelNotFound: string;
    readonly applicationNotCancellable: string;
    readonly applicationNotRejectable: string;
    readonly userApplicationRejected: string;
    readonly applicationEmbedTitle: string;
    readonly applicationEmbedDescriptionStatus: string;
    readonly applicationEmbedDescriptionReason: string;
    readonly applicationStatusPendingApproval: string;
    readonly applicationStatusInVote: string;
    readonly applicationStatusInReview: string;
    readonly applicationStatusCancelled: string;
    readonly applicationStatusRejected: string;
    readonly applicationStatusAccepted: string;
    readonly disagreeVotesExists: string;
}

/**
 * Localizations for the `FancyApplication` database utility.
 */
export class FancyApplicationLocalization extends Localization<FancyApplicationStrings> {
    protected override readonly localizations: Readonly<
        Translations<FancyApplicationStrings>
    > = {
        en: new FancyApplicationENTranslation(),
    };
}
