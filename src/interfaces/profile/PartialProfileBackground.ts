import { DatabaseProfileBackground } from "@alice-interfaces/database/aliceDb/DatabaseProfileBackground";

/**
 * Partial profile background object used for
 * storing backgrounds in `PlayerInfo` instances.
 */
export type PartialProfileBackground = Pick<
    DatabaseProfileBackground,
    "id" | "name"
>;
