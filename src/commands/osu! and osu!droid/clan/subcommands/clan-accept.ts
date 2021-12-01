import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const toAccept: User = interaction.options.getUser("user", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.acceptClanInvitationConfirmation,
                toAccept.toString()
            ),
        },
        [toAccept.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const firstResult: OperationResult = await clan.addMember(toAccept);

    if (!firstResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.acceptClanInvitationFailed,
                toAccept.toString(),
                firstResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.acceptClanInvitationFailed,
                toAccept.toString(),
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.acceptClanInvitationSuccessful,
            toAccept.toString(),
            clan.name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
