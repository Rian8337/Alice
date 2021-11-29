import { BaseDocument } from "../BaseDocument";

/**
 * Represents a droid performance point (dpp) API key.
 */
export interface DatabaseDPPAPIKey extends BaseDocument {
    /**
     * The API key.
     */
    key: string;

    /**
     * The owner of the API key.
     */
    owner: string;
}