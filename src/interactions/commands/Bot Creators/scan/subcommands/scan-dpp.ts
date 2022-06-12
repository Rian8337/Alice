import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ScanLocalization } from "@alice-localization/interactions/commands/Bot Creators/scan/ScanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Collection, Snowflake } from "discord.js";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    const localization: ScanLocalization = new ScanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let calculatedCount: number = 0;

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("scanStarted")
        ),
    });

    let players: Collection<Snowflake, UserBind>;

    while ((players = await dbManager.getDPPUnscannedPlayers(50)).size) {
        for (const player of players.values()) {
            client.logger.info(`Now calculating ID ${player.discordid}`);

            await player.scanDPP();

            const finalPP: number = DPPHelper.calculateFinalPerformancePoints(
                player.pp
            );

            client.logger.info(`Final pp: ${finalPP}`);
            client.logger.info(`${++calculatedCount} players scanned`);
        }
    }

    await dbManager.update({}, { $unset: { dppScanComplete: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("scanComplete"),
            interaction.user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
