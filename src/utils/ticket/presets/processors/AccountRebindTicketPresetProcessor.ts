import { ProcessedSupportTicketPreset } from "@alice-structures/utils/ProcessedSupportTicketPreset";
import { ModalSubmitInteraction } from "discord.js";
import { BaseTicketPresetProcessor } from "./BaseTicketPresetProcessor";
import { Language } from "@alice-localization/base/Language";
import { AccountRebindTicketPresetProcessorLocalization } from "@alice-localization/utils/ticket/presets/processors/AccountRebindTicketPresetProcessor/AccountRebindTicketPresetProcessorLocalization";
import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Constants } from "@alice-core/Constants";
import { Config } from "@alice-core/Config";

/**
 * The ticket preset processor for account rebinds.
 */
export class AccountRebindTicketPresetProcessor extends BaseTicketPresetProcessor {
    override async processModalFields(
        interaction: ModalSubmitInteraction,
        language: Language = "en",
    ): Promise<ProcessedSupportTicketPreset | null> {
        const localization = new AccountRebindTicketPresetProcessorLocalization(
            language,
        );

        const username = interaction.fields.getTextInputValue("username");
        const email = interaction.fields.getTextInputValue("email");
        const reason = interaction.fields.getTextInputValue("reason");

        const player = await Player.getInformation(username);
        if (!player) {
            return this.invalidateModal(
                interaction,
                localization.getTranslation("playerNotFound"),
            );
        }

        if (player.email !== email) {
            return this.invalidateModal(
                interaction,
                localization.getTranslation("incorrectEmail"),
            );
        }

        const bindInfo =
            await DatabaseManager.elainaDb.collections.userBind.getFromUid(
                player.uid,
                { projection: { _id: 0, discordid: 1 } },
            );

        if (!bindInfo) {
            return this.invalidateModal(
                interaction,
                localization.getTranslation("accountNotBound"),
            );
        }

        // if (bindInfo.discordid === interaction.user.id) {
        //     return this.invalidateModal(
        //         interaction,
        //         localization.getTranslation("accountNotBound"),
        //     );
        // }

        const guild = await this.client.guilds.fetch(Constants.mainServer);
        const role = await guild.roles
            .fetch(Config.verifyPerm[2])
            .catch(() => null);

        return {
            title: `osu!droid Account Rebind (${player.uid})`,
            description: `I would like to request an osu!droid account rebind with uid ${player.uid} with the following reason:\n\n${reason}`,
            assignees: role?.members.map((v) => v.id),
        };
    }

    protected override invalidateModal(
        interaction: ModalSubmitInteraction,
        rejectionResponse: string,
    ): Promise<null> {
        return super.invalidateModal(
            interaction,
            StringHelper.formatString(
                rejectionResponse,
                interaction.fields.getTextInputValue("reason"),
            ),
        );
    }
}
