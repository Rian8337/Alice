import { Translation } from "@localization/base/Translation";
import { ClanAuctionStrings } from "../ClanAuctionLocalization";

/**
 * The English translation for the `ClanAuction` database utility.
 */
export class ClanAuctionENTranslation extends Translation<ClanAuctionStrings> {
    override readonly translations: ClanAuctionStrings = {
        auctionHasntExpired: "not the time to end auction yet",
        noWinningClan: "no winning clan",
        auctioneerNotFound: "auctioneer not found",
    };
}
