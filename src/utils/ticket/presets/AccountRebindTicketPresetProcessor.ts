import {
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { AccountRebindTicketPresetProcessorLocalization } from "@alice-localization/utils/ticket/presets/AccountRebindTicketPresetProcessor/AccountRebindTicketPresetProcessorLocalization";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ModalTicketPresetProcessor } from "./ModalTicketPresetProcessor";
import { ProcessedSupportTicketPreset } from "@alice-structures/utils/ProcessedSupportTicketPreset";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Language } from "@alice-localization/base/Language";
import { Player } from "@rian8337/osu-droid-utilities";
import { Constants } from "@alice-core/Constants";
import { Config } from "@alice-core/Config";
import { ModalRepliableInteraction } from "@alice-structures/core/ModalRepliableInteraction";
import { DatabaseSupportTicketPreset } from "@alice-structures/database/aliceDb/DatabaseSupportTicketPreset";

/**
 * The ticket preset processor for account rebinds.
 */
export class AccountRebindTicketPresetProcessor extends ModalTicketPresetProcessor {
    override async processModalSubmission(
        interaction: ModalSubmitInteraction,
    ): Promise<ProcessedSupportTicketPreset | null> {
        const localization = this.getLocalization(
            await CommandHelper.getLocale(interaction),
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
            title: `osu!droid Account Rebind (${player.uid})`,
            description: `I would like to request an osu!droid account rebind with uid ${player.uid} with the following reason:\n\n${reason}`,
            assignees: role?.members.map((v) => v.id),
        };
    }

    protected override async processInitialInteraction(
        interaction: ModalRepliableInteraction,
        preset: DatabaseSupportTicketPreset,
    ): Promise<unknown> {
        const localization = this.getLocalization(
            await CommandHelper.getLocale(interaction),
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
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("bindLimitReached"),
                ),
            });
        }

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
