import { Translation } from "@alice-localization/base/Translation";
import { ClanAuctionStrings } from "../ClanAuctionLocalization";

/**
 * The Indonesian translation for the `ClanAuction` database utility.
 */
export class ClanAuctionIDTranslation extends Translation<ClanAuctionStrings> {
    override readonly translations: ClanAuctionStrings = {
        auctionHasntExpired: "",
        noWinningClan: "",
        auctioneerNotFound: "",
    };
}
