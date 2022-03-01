import { Translation } from "@alice-localization/base/Translation";
import { ClanStrings } from "../ClanLocalization";

/**
 * The English translation for the `Clan` database utility.
 */
export class ClanENTranslation extends Translation<ClanStrings> {
    override readonly translations: ClanStrings = {
        clanLeaderNotFound: "clan leader not found",
        userInCurrentClan: "user is already in this clan",
        userInAnotherClan: "user is already in another clan",
        userInCooldownForOldClan: "user is still in cooldown to join old clan",
        userInCooldownForClan: "user is still in cooldown to join a clan",
        userBindedAccountNotFound: "user's binded accounts not found",
        clanLeaderCannotLeaveClan: "clan leader cannot leave the clan",
        userNotInClan: "user is not in the clan",
        leaderIsTheSame: "new leader is the same as the old leader",
        cannotFindNewLeader: "cannot find new leader",
        clanInMatchMode: "clan is already in match mode",
        clanNotInMatchMode: "clan is already not in match mode",
        noClanRole: "clan role doesn't exist",
        invalidImage: "invalid image",
        invalidImageRatio: "image ratio is not 18:5",
        descriptionTooLong: "description must be less than 2000 characters",
        clanPowerNegativeWarning: "clan power will fall below zero",
        clanPowerInfiniteWarning: "clan power will be infinite",
    };
}
