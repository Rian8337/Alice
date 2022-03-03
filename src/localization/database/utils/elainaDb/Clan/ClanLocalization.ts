import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ClanENTranslation } from "./translations/ClanENTranslation";
import { ClanESTranslation } from "./translations/ClanESTranslation";
import { ClanIDTranslation } from "./translations/ClanIDTranslation";
import { ClanKRTranslation } from "./translations/ClanKRTranslation";

export interface ClanStrings {
    readonly clanLeaderNotFound: string;
    readonly userInCurrentClan: string;
    readonly userInAnotherClan: string;
    readonly userInCooldownForOldClan: string;
    readonly userInCooldownForClan: string;
    readonly userBindedAccountNotFound: string;
    readonly clanLeaderCannotLeaveClan: string;
    readonly userNotInClan: string;
    readonly leaderIsTheSame: string;
    readonly cannotFindNewLeader: string;
    readonly clanInMatchMode: string;
    readonly clanNotInMatchMode: string;
    readonly noClanRole: string;
    readonly invalidImage: string;
    readonly invalidImageRatio: string;
    readonly descriptionTooLong: string;
    readonly clanPowerNegativeWarning: string;
    readonly clanPowerInfiniteWarning: string;
}

/**
 * Localizations for the `Clan` database utility.
 */
export class ClanLocalization extends Localization<ClanStrings> {
    protected override readonly localizations: Readonly<
        Translations<ClanStrings>
    > = {
        en: new ClanENTranslation(),
        kr: new ClanKRTranslation(),
        id: new ClanIDTranslation(),
        es: new ClanESTranslation(),
    };
}
