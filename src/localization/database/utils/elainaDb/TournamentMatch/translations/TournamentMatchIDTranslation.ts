import { Translation } from "@alice-localization/base/Translation";
import { TournamentMatchStrings } from "../TournamentMatchLocalization";

/**
 * The Indonesian translation for the `TournamentMatch` database utility.
 */
export class TournamentMatchIDTranslation extends Translation<TournamentMatchStrings> {
    override readonly translations: TournamentMatchStrings = {
        scoreNotFound: "",
        modsIsNotUsed: "",
        replayNotFound: "",
        unsupportedGameVersion: "",
        modsExceptNotUsed: "",
        modsWasUsed: "",
        teamMembersIncorrectFMmod: "",
    };
}
