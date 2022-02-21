import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Powerup } from "@alice-interfaces/clan/Powerup";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const powerupType: PowerupType = <PowerupType>(
        interaction.options.getString("name", true)
    );

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("selfIsNotInClan")),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    if (clan.isMatch) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("powerupActivateInMatchMode")
            ),
        });
    }

    if (clan.active_powerups.includes(powerupType)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("powerupIsAlreadyActive")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("activatePowerupConfirmation"),
                powerupType
            ),
        },
        [interaction.user.id],
        20,
        language
    );

    if (!confirmation) {
        return;
    }

    const powerup: Powerup | undefined = clan.powerups.get(powerupType);

    if (!powerup || powerup.amount === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntHavePowerup")
            ),
        });
    }

    --powerup.amount;

    clan.active_powerups.push(powerupType);

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("activatePowerupFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("activatePowerupSuccessful")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
