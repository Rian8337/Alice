import "module-alias/register";
import { config } from "dotenv";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { consola } from "consola";
process.env.UV_THREADPOOL_SIZE = "128";

config();

DatabaseManager.init().then(async () => {
    const dbManager = DatabaseManager.elainaDb.collections.userBind;

    const uncalculatedCount =
        await dbManager.getRecalcUncalculatedPlayerCount();

    if (uncalculatedCount === 0) {
        process.exit(0);
    }

    let calculatedCount = await dbManager.getRecalcCalculatedPlayerCount();

    const total = calculatedCount + uncalculatedCount;

    let player: UserBind | null;

    while ((player = await dbManager.getRecalcUnscannedPlayers(1))) {
        consola.info(`Now calculating ID ${player.discordid}`);

        await player.recalculateAllScores(true);

        consola.info(
            `${++calculatedCount}/${total} players recalculated (${(
                (calculatedCount * 100) /
                total
            ).toFixed(2)}%)`,
        );
    }

    consola.info("Recalculation done");

    process.exit(0);
});
