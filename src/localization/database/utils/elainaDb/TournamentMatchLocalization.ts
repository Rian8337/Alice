import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TournamentMatchStrings {
    readonly scoreNotFound: string;
    readonly modsIsNotUsed: string;
    readonly replayNotFound: string;
    readonly unsupportedGameVersion: string;
    readonly modsExceptNotUsed: string;
    readonly modsWasUsed: string;
    readonly teamMembersIncorrectFMmod: string;
}

/**
 * Localizations for the `TournamentMatch` database utility.
 */
export class TournamentMatchLocalization extends Localization<TournamentMatchStrings> {
    protected override readonly translations: Readonly<
        Translation<TournamentMatchStrings>
    > = {
        en: {
            scoreNotFound: "Score not found",
            modsIsNotUsed: "%s is not used",
            replayNotFound: "Replay not found",
            unsupportedGameVersion: "Unsupported osu!droid version",
            modsExceptNotUsed: "Other mods except %s was used",
            modsWasUsed: "%s was used",
            teamMembersIncorrectFMmod: "No team members enabled HD/HR/EZ",
        },
    };
}
