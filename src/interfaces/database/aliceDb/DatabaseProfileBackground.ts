import { BaseDocument } from "../BaseDocument";

/**
 * Represents a profile background that is applicable to profile commands.
 */
export interface DatabaseProfileBackground extends BaseDocument {
    /**
     * The ID of the background.
     */
    id: string;

    /**
     * The name of the background.
     */
    name: string;
}
