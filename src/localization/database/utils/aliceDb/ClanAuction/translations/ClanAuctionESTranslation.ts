import { Translation } from "@alice-localization/base/Translation";
import { ClanAuctionStrings } from "../ClanAuctionLocalization";

/**
 * The Spanish translation for the `ClanAuction` database utility.
 */
export class ClanAuctionESTranslation extends Translation<ClanAuctionStrings> {
    override readonly translations: ClanAuctionStrings = {
        auctionHasntExpired: "no es momento aun de terminar la subasta",
        noWinningClan: "ningun clan ganador",
        auctioneerNotFound: "subastador no encontrado",
    };
}
