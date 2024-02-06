import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { RepliableInteraction } from "discord.js";

/**
 * The base of ticket preset validators.
 */
export abstract class BaseTicketPresetValidator {
    /**
     * Validates whether an interaction can use this preset.
     *
     * @param interaction The interaction.
     * @returns Whether the interaction can use the preset.
     */
    abstract validate(interaction: RepliableInteraction): Promise<boolean>;

    /**
     * Invalidates an interaction from using this preset.
     *
     * @param interaction The interaction.
     * @param invalidationResponse The response for invalidating the interaction.
     * @returns Always `false`.
     */
    protected async invalidate(
        interaction: RepliableInteraction,
        invalidationResponse: string,
    ): Promise<false> {
        await InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(invalidationResponse),
        });

        return false;
    }
}
