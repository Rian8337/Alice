import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ClanAuctionStrings {
    readonly auctionHasntExpired: string;
    readonly noWinningClan: string;
    readonly auctioneerNotFound: string;
}

/**
 * Localizations for the `ClanAuction` database utility.
 */
export class ClanAuctionLocalization extends Localization<ClanAuctionStrings> {
    protected override readonly translations: Readonly<
        Translation<ClanAuctionStrings>
    > = {
        en: {
            auctionHasntExpired: "not the time to end auction yet",
            noWinningClan: "no winning clan",
            auctioneerNotFound: "auctioneer not found",
        },
        kr: {
            auctionHasntExpired: "아직 경매를 끝낼 시간이 아님",
            noWinningClan: "경매 낙찰 클랜 없음",
            auctioneerNotFound: "경매인(경매 시작자)이 발견되지 않음",
        },
    };
}
