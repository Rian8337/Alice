import { Translation } from "@localization/base/Translation";
import { TournamentMatchStrings } from "../TournamentMatchLocalization";

/**
 * The English translation for the `TournamentMatch` database utility.
 */
export class TournamentMatchENTranslation extends Translation<TournamentMatchStrings> {
    override readonly translations: TournamentMatchStrings = {
        scoreNotFound: "Score not found",
        modsIsNotUsed: "%s is not used",
        replayNotFound: "Replay not found",
        unsupportedGameVersion: "Unsupported osu!droid version",
        modsExceptNotUsed: "Other mods except %s was used",
        modsWasUsed: "%s was used",
        teamMembersIncorrectFMmod: "No team members enabled HD/HR/EZ",
    };
}
