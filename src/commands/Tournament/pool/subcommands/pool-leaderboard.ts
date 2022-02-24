import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { PoolLocalization } from "@alice-localization/commands/Tournament/PoolLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: PoolLocalization = new PoolLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const pick: string = interaction.options.getString("pick", true);

    const pool: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            id
        );

    if (!pool) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("poolNotFound")
            ),
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
