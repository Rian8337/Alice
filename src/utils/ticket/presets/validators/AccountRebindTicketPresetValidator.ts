import { RepliableInteraction } from "discord.js";
import { BaseTicketPresetValidator } from "./BaseTicketPresetValidator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AccountRebindTicketPresetValidatorLocalization } from "@alice-localization/utils/ticket/presets/validators/AccountRebindTicketPresetValidator/AccountRebindTicketPresetValidatorLocalization";

/**
 * The ticket preset validator for account rebinds.
 */
export class AccountRebindTicketPresetValidator extends BaseTicketPresetValidator {
    override async validate(
        interaction: RepliableInteraction,
    ): Promise<boolean> {
        const language = await CommandHelper.getLocale(interaction);
        const localization = new AccountRebindTicketPresetValidatorLocalization(
            language,
        );

        const bindInfo =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user,
                {
                    projection: {
                        _id: 0,
                        previous_bind: 1,
                    },
                },
            );

        const binds = bindInfo?.previous_bind ?? [];

        if (binds.length > 2) {
            return this.invalidate(
                interaction,
                localization.getTranslation("bindLimitReached"),
            );
        }

        return true;
    }
}
