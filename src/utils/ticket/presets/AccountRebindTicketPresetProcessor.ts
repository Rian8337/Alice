import {
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { AccountRebindTicketPresetProcessorLocalization } from "@localization/utils/ticket/presets/AccountRebindTicketPresetProcessor/AccountRebindTicketPresetProcessorLocalization";
import { DatabaseManager } from "@database/DatabaseManager";
import { ModalTicketPresetProcessor } from "./ModalTicketPresetProcessor";
import { ProcessedSupportTicketPreset } from "@structures/utils/ProcessedSupportTicketPreset";
import { StringHelper } from "@utils/helpers/StringHelper";
import { Language } from "@localization/base/Language";
import { Player } from "@rian8337/osu-droid-utilities";
import { Constants } from "@core/Constants";
import { Config } from "@core/Config";
import { ModalRepliableInteraction } from "@structures/core/ModalRepliableInteraction";
import { DatabaseSupportTicketPreset } from "@structures/database/aliceDb/DatabaseSupportTicketPreset";
import { DroidHelper } from "@utils/helpers/DroidHelper";

/**
 * The ticket preset processor for account rebinds.
 */
export class AccountRebindTicketPresetProcessor extends ModalTicketPresetProcessor {
    override async processModalSubmission(
        interaction: ModalSubmitInteraction,
    ): Promise<ProcessedSupportTicketPreset | null> {
        const localization = this.getLocalization(
            CommandHelper.getLocale(interaction),
        );

        const username = interaction.fields.getTextInputValue("username");
        const email = interaction.fields.getTextInputValue("email");
        const reason = interaction.fields.getTextInputValue("reason");

        const player = await DroidHelper.getPlayer(username, ["id", "email"]);

        if (!player || player instanceof Player) {
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
                player.id,
                { projection: { _id: 0, discordid: 1 } },
            );

        if (!bindInfo) {
            return this.invalidateModal(
                interaction,
                localization.getTranslation("accountNotBound"),
            );
        }

        if (bindInfo.discordid === interaction.user.id) {
            return this.invalidateModal(
                interaction,
                localization.getTranslation("accountNotBound"),
            );
        }

        const guild = await this.client.guilds.fetch(Constants.mainServer);
        const role = await guild.roles
            .fetch(Config.verifyPerm[2])
            .catch(() => null);

        return {
            title: `osu!droid Account Rebind (${player.id})`,
            description: `I would like to request an osu!droid account rebind with uid ${player.id} with the following reason:\n\n${reason}`,
            assignees: role?.members.map((v) => v.id),
        };
    }

    protected override async processInitialInteraction(
        interaction: ModalRepliableInteraction,
        preset: DatabaseSupportTicketPreset,
    ): Promise<void> {
        const localization = this.getLocalization(
            CommandHelper.getLocale(interaction),
        );

        const modal = this.createModal(
            preset,
            new TextInputBuilder()
                .setCustomId("username")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(20)
                .setLabel(localization.getTranslation("usernameLabel")),
            new TextInputBuilder()
                .setCustomId("email")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100)
                .setPlaceholder(localization.getTranslation("emailPlaceholder"))
                .setLabel(localization.getTranslation("emailLabel")),
            new TextInputBuilder()
                .setCustomId("reason")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1250)
                .setPlaceholder(
                    localization.getTranslation("reasonPlaceholder"),
                )
                .setLabel(localization.getTranslation("reasonLabel")),
        );

        await interaction.showModal(modal);
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

    private getLocalization(language: Language) {
        return new AccountRebindTicketPresetProcessorLocalization(language);
    }
}
