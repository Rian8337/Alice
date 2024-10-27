import { DatabaseSupportTicketPreset } from "@structures/database/aliceDb/DatabaseSupportTicketPreset";
import { Manager } from "@utils/base/Manager";
import { RepliableInteraction } from "discord.js";

/**
 * The base of ticket preset processors.
 */
export abstract class BaseTicketPresetProcessor extends Manager {
    /**
     * Processes an interaction based on a ticket preset.
     *
     * @param interaction The interaction.
     * @param preset The ticket preset to process on.
     */
    abstract process(
        interaction: RepliableInteraction,
        preset: DatabaseSupportTicketPreset,
    ): Promise<unknown>;
}
