import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const clan: Clan | null = await DatabaseManager.elainaDb.collections.clan.getFromUser(interaction.user);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan)
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        { content: MessageCreator.createWarn(clanStrings.leaveClanConfirmation) },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await clan.removeMember(interaction.user);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.leaveClanFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.leaveClanSuccessful, clan.name
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};