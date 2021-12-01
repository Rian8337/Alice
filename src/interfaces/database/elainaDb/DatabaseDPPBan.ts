import { BaseDocument } from "../BaseDocument";

/**
 * Represents a droid performance point (dpp) ban information of a user.
 */
export interface DatabaseDPPBan extends BaseDocument {
    /**
     * The UID of the banned account.
     */
    uid: number;

    /**
     * The reason the account was banned.
     */
    reason: string;
}
