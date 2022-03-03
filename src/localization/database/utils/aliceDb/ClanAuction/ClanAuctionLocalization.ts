import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ClanAuctionENTranslation } from "./translations/ClanAuctionENTranslation";
import { ClanAuctionESTranslation } from "./translations/ClanAuctionESTranslation";
import { ClanAuctionIDTranslation } from "./translations/ClanAuctionIDTranslation";
import { ClanAuctionKRTranslation } from "./translations/ClanAuctionKRTranslation";

export interface ClanAuctionStrings {
    readonly auctionHasntExpired: string;
    readonly noWinningClan: string;
    readonly auctioneerNotFound: string;
}

/**
 * Localizations for the `ClanAuction` database utility.
 */
export class ClanAuctionLocalization extends Localization<ClanAuctionStrings> {
    protected override readonly localizations: Readonly<
        Translations<ClanAuctionStrings>
    > = {
        en: new ClanAuctionENTranslation(),
        kr: new ClanAuctionKRTranslation(),
        id: new ClanAuctionIDTranslation(),
        es: new ClanAuctionESTranslation(),
    };
}
