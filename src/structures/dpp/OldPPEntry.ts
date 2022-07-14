import { PPEntry } from "./PPEntry";

/**
 * Represents a droid performance points (dpp) entry produced using
 * the old dpp calculation algorithm.
 */
export type OldPPEntry = Omit<PPEntry, "scoreID">;
