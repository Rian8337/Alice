import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePPCollectionManager } from "@alice-database/managers/aliceDb/PrototypePPCollectionManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { RecalcLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/RecalcLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: RecalcLocalization = new RecalcLocalization(await CommandHelper.getLocale(interaction));

    const dbManager: PrototypePPCollectionManager =
        DatabaseManager.aliceDb.collections.prototypePP;

    let calculatedCount: number = 0;

    await interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcInProgress")
        ),
    });

    if (interaction.options.getBoolean("resetprogress")) {
        await dbManager.update({}, { $set: { scanDone: false } });
    }

    let player: PrototypePP | undefined;

    while ((player = (await dbManager.getUnscannedPlayers(1)).first())) {
        client.logger.info(`Now calculating ID ${player.discordid}`);

        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                player.discordid
            );

        if (!bindInfo) {
            await dbManager.delete({ discordid: player.discordid });
            continue;
        }

        await bindInfo.calculatePrototypeDPP();

        client.logger.info(`${++calculatedCount} players recalculated`);
    }

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcSuccess"),
            interaction.user.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
