import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ScanLocalization } from "@alice-localization/interactions/commands/Bot Creators/scan/ScanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Collection, Snowflake } from "discord.js";
import consola from "consola";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
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

    while (
        (players = await dbManager.getDPPUnscannedPlayers(50, {
            projection: { _id: 0, pp: 1, playc: 1 },
        })).size
    ) {
        for (const player of players.values()) {
            consola.info(`Now calculating ID ${player.discordid}`);

            await player.scanDPP();

            const finalPP: number = DPPHelper.calculateFinalPerformancePoints(
                player.pp
            );

            consola.info(`Final pp: ${finalPP}`);
            consola.info(`${++calculatedCount} players scanned`);
        }
    }

    await dbManager.updateMany({}, { $unset: { dppScanComplete: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("scanComplete"),
            interaction.user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
