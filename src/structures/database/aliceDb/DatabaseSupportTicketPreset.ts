import { BaseDocument } from "../BaseDocument";

/**
 * Represents a preset of a support ticket.
 */
export interface DatabaseSupportTicketPreset extends BaseDocument {
    /**
     * The ID of the preset.
     */
    readonly id: number;

    /**
     * The name of the preset.
     */
    readonly name: string;

    /**
     * The title of the preset.
     */
    readonly title: string;
}
