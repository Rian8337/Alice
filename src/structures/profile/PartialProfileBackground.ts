import { DatabaseProfileBackground } from "structures/database/aliceDb/DatabaseProfileBackground";

/**
 * Partial profile background object used for
 * storing backgrounds in `PlayerInfo` instances.
 */
export type PartialProfileBackground = Pick<
    DatabaseProfileBackground,
    "id" | "name"
>;
