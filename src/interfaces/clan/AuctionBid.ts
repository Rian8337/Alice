/**
 * Represents a bid in a clan auction.
 */
export interface AuctionBid {
    /**
     * The clan that made the bid.
     */
    clan: string;

    /**
     * The amount of coins that the clan has bid.
     */
    amount: number;
}