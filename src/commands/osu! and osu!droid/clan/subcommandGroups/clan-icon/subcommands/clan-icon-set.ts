import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    const url: string = interaction.options.getString("url", true);

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

    const setResult: OperationResult = await clan.setIcon(url);

    if (!setResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.setIconFailed,
                setResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.setIconFailed,
                setResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(clanStrings.setIconSuccessful),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
