import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { RegisterFancyVoteENTranslation } from "./translations/RegisterFancyVoteENTranslation";

export interface RegisterFancyVoteStrings {
    readonly voteNotFound: string;
    readonly submitReasonModalTitle: string;
    readonly submitReasonModalLabel: string;
    readonly submitReasonModalPlaceholder: string;
    readonly voteRegistrationFailed: string;
    readonly voteRegistrationSuccess: string;
}

/**
 * Localizations for the `registerFancyVote` button command.
 */
export class RegisterFancyVoteLocalization extends Localization<RegisterFancyVoteStrings> {
    protected override readonly localizations: Readonly<
        Translations<RegisterFancyVoteStrings>
    > = {
        en: new RegisterFancyVoteENTranslation(),
    };
}
