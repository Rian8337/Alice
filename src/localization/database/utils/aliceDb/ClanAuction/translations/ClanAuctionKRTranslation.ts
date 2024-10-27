import { Translation } from "@localization/base/Translation";
import { ClanAuctionStrings } from "../ClanAuctionLocalization";

/**
 * The Korean translation for the `ClanAuction` database utility.
 */
export class ClanAuctionKRTranslation extends Translation<ClanAuctionStrings> {
    override readonly translations: ClanAuctionStrings = {
        auctionHasntExpired: "아직 경매를 끝낼 시간이 아님",
        noWinningClan: "경매 낙찰 클랜 없음",
        auctioneerNotFound: "경매인(경매 시작자)이 발견되지 않음",
    };
}
