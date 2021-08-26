import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { ClanOperationResult } from "@alice-interfaces/clan/ClanOperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    const description: string = interaction.options.getString("description", true);

    if (description.length >= 2000) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDescriptionTooLong)
        });
    }

    const clan: Clan | null = await DatabaseManager.elainaDb.collections.clan.getFromUser(interaction.user);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan)
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfHasNoAdministrativePermission)
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        { content: MessageCreator.createWarn(clanStrings.editDescriptionConfirmation) },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const editDescResult: ClanOperationResult = clan.setDescription(description);

    if (!editDescResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clearDescriptionFailed, editDescResult.reason!)
        });
    }

    const finalResult: ClanOperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clearDescriptionFailed, finalResult.reason!)
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(clanStrings.clearDescriptionSuccessful)
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};