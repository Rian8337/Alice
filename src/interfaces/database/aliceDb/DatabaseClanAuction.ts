import { AuctionBid } from "@alice-interfaces/clan/AuctionBid";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a clan auction in database.
 */
export interface DatabaseClanAuction extends BaseDocument {
    /**
     * The name of the auction.
     */
    name: string;

    /**
     * The clan that made this auction.
     */
    auctioneer: string;

    /**
     * The epoch time at which this auction was created, in seconds.
     */
    creationdate: number;

    /**
     * The epoch time at which this auction will expire, in seconds.
     */
    expirydate: number;

    /**
     * The minimum amount of Alice coins required to bid in this auction.
     */
    min_price: number;

    /**
     * The name of the powerup that is being auctioned.
     */
    powerup: PowerupType;

    /**
     * The amount of the powerup that is being auctioned.
     */
    amount: number;

    /**
     * The bids that have been made in this auction, sorted by highest amount.
     */
    bids: AuctionBid[];
}