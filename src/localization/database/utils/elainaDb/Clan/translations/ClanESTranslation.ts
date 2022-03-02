import { Translation } from "@alice-localization/base/Translation";
import { ClanStrings } from "../ClanLocalization";

/**
 * The Spanish translation for the `clan` command.
 */
export class ClanESTranslation extends Translation<ClanStrings> {
    override readonly translations: ClanStrings = {
        clanLeaderNotFound: "",
        userInCurrentClan: "",
        userInAnotherClan: "",
        userInCooldownForOldClan: "",
        userInCooldownForClan: "",
        userBindedAccountNotFound: "",
        clanLeaderCannotLeaveClan: "",
        userNotInClan: "",
        leaderIsTheSame: "",
        cannotFindNewLeader: "",
        clanInMatchMode: "",
        clanNotInMatchMode: "",
        noClanRole: "",
        invalidImage: "",
        invalidImageRatio: "",
        descriptionTooLong: "",
        clanPowerNegativeWarning: "",
        clanPowerInfiniteWarning: "",
    };
}
