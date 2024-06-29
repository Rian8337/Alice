import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { FancyApplicationInitiateVoteENTranslation } from "./translations/FancyApplicationInitiateVoteENTranslation";

export interface FancyApplicationInitiateVoteStrings {
    readonly userNotification: string;
    readonly applicationNotPending: string;
    readonly voteEmbedTitle: string;
    readonly voteEmbedDescription: string;
    readonly fancyVoteYes: string;
    readonly fancyVoteNo: string;
    readonly voteCreationFailed: string;
    readonly voteCreationSuccess: string;
}

/**
 * Localizations for the `fancyApplicationInitiateVote` button command.
 */
export class FancyApplicationInitiateVoteLocalization extends Localization<FancyApplicationInitiateVoteStrings> {
    protected override readonly localizations: Readonly<
        Translations<FancyApplicationInitiateVoteStrings>
    > = {
        en: new FancyApplicationInitiateVoteENTranslation(),
    };
}
