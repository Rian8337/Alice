import { DatabaseProfileBadge } from "structures/database/aliceDb/DatabaseProfileBadge";

/**
 * Represents a profile badge with owner information.
 */
export interface ProfileBadgeOwnerInfo extends DatabaseProfileBadge {
    isOwned: boolean;
}
