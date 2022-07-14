import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { DatabaseClanAuction } from "structures/database/aliceDb/DatabaseClanAuction";
import { Collection as DiscordCollection } from "discord.js";

/**
 * A manager for the `clanauction` collection.
 */
export class ClanAuctionCollectionManager extends DatabaseCollectionManager<
    DatabaseClanAuction,
    ClanAuction
> {
    protected override readonly utilityInstance: new (
        data: DatabaseClanAuction
    ) => ClanAuction = ClanAuction;

    override get defaultDocument(): DatabaseClanAuction {
        const currentTime: number = Math.floor(Date.now() / 1000);

        return {
            amount: 0,
            auctioneer: "",
            bids: [],
            creationdate: currentTime,
            expirydate: currentTime,
            min_price: 0,
            name: "",
            powerup: "challenge",
        };
    }

    /**
     * Gets a clan auction from its name.
     *
     * @param name The name of the auction.
     */
    getFromName(name: string): Promise<ClanAuction | null> {
        return this.getOne({ name: name });
    }

    /**
     * Gets a clan's auctions.
     *
     * @param clanName The name of the clan.
     * @returns The clan's auctions, mapped by their name.
     */
    getClanAuctions(
        clanName: string
    ): Promise<DiscordCollection<string, ClanAuction>> {
        return this.get("name", { auctioneer: clanName });
    }

    /**
     * Gets clan auctions that have expired within the specified time limit.
     *
     * @param timelimit The time limit.
     * @returns Auctions that have expired within the time limit.
     */
    getExpiredAuctions(
        timelimit: number
    ): Promise<DiscordCollection<string, ClanAuction>> {
        return this.get("name", { expirydate: { $lte: timelimit } });
    }
}
