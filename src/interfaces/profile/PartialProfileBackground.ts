import { DatabaseProfileBackground } from "@alice-interfaces/database/aliceDb/DatabaseProfileBackground";

/**
 * Partial profile background object used for
 * storing backgrounds in `PlayerInfo` instances.
 */
export interface PartialProfileBackground extends Pick<DatabaseProfileBackground, "id" | "name"> { };