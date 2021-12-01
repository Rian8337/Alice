import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    const name: string = interaction.options.getString("name", true);

    const amount: number = interaction.options.getInteger("amount", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(name);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDoesntExist),
        });
    }

    const incrementResult: OperationResult = clan.incrementPower(-amount);

    if (!incrementResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.modifyClanPowerFailed,
                incrementResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.modifyClanPowerFailed,
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.modifyClanPowerSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
