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
    };
}
