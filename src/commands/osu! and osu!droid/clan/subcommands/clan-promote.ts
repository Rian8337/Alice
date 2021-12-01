import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const toPromote: User = interaction.options.getUser("member", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    if (!clan.member_list.has(toPromote.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.userIsNotInExecutorClan
            ),
        });
    }

    if (clan.hasAdministrativePower(toPromote)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.userIsAlreadyCoLeader
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.promoteMemberConfirmation
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    clan.member_list.get(toPromote.id)!.hasPermission = true;

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.promoteMemberFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.promoteMemberSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
