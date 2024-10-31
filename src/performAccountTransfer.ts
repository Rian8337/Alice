import { DatabaseManager } from "@database/DatabaseManager";
import { officialPool } from "@database/official/OfficialDatabasePool";
import {
    constructOfficialDatabaseTable,
    OfficialDatabaseTables,
} from "@database/official/OfficialDatabaseTables";
import { OfficialDatabaseBestScore } from "@database/official/schema/OfficialDatabaseBestScore";
import { RowDataPacket } from "mysql2";

Promise.all([DatabaseManager.init(), officialPool.connect()]).then(async () => {
    const dbManager = DatabaseManager.aliceDb.collections.accountTransfer;
    const transfers = await dbManager.get(
        "discordId",
        { transferDone: { $ne: true } },
        { projection: { _id: 0 } },
    );

    const userTable = constructOfficialDatabaseTable(
        OfficialDatabaseTables.user,
    );

    const scoreTables = [
        OfficialDatabaseTables.score,
        OfficialDatabaseTables.bestScore,
        OfficialDatabaseTables.bannedScore,
        OfficialDatabaseTables.bestBannedScore,
    ].map(constructOfficialDatabaseTable);

    const scoreTable = scoreTables[0];
    const bestScoreTable = scoreTables[1];

    for (const transfer of transfers.values()) {
        const connection = await officialPool.getConnection();

        try {
            await connection.beginTransaction();

            for (const uidToTransfer of transfer.transferList) {
                // Mark the uid as archived.
                await connection.query(
                    `UPDATE ${userTable} SET archived = 1 WHERE id = ?`,
                    [uidToTransfer],
                );

                // Transfer the scores.
                for (const table of scoreTables) {
                    await connection.query(
                        `UPDATE ${table} SET uid = ? WHERE uid = ?`,
                        [transfer.transferUid, uidToTransfer],
                    );
                }
            }

            const valuesArr = [transfer.transferUid, transfer.transferUid];

            await connection.query(
                `UPDATE ${userTable} SET score = (SELECT SUM(score) FROM ${scoreTable} WHERE uid = ?) WHERE id = ?`,
                valuesArr,
            );

            const topScores = await connection
                .query<
                    RowDataPacket[]
                >(`SELECT pp, accuracy FROM ${bestScoreTable} WHERE uid = ? ORDER BY pp DESC LIMIT 100`, [transfer.transferUid])
                .then(
                    (res) =>
                        res[0] as Pick<
                            OfficialDatabaseBestScore,
                            "pp" | "accuracy"
                        >[],
                );

            let totalPP = 0;
            let accuracy = 0;
            let accuracyWeight = 0;

            for (let i = 0; i < topScores.length; ++i) {
                const score = topScores[i];
                const weight = Math.pow(0.95, i);

                totalPP += score.pp * weight;
                accuracy += score.accuracy * weight;
                accuracyWeight += weight;
            }

            if (accuracy > 0) {
                accuracy /= accuracyWeight;
            } else {
                accuracy = 1;
            }

            await connection.query(
                `UPDATE ${userTable} SET pp = ${totalPP}, accuracy = ${accuracy} WHERE id = ?`,
                valuesArr,
            );

            await connection.query(
                `UPDATE ${userTable} SET playcount = (SELECT COUNT(*) FROM ${scoreTable} WHERE uid = ? AND score > 0) WHERE id = ?`,
                valuesArr,
            );

            await connection.commit();

            console.log(
                `Transfer for ${transfer.discordId} has been completed.`,
            );
        } catch (e) {
            console.error(
                `Failed to transfer account for ${transfer.discordId}: ${e}`,
            );

            await connection.rollback();
        } finally {
            connection.release();
        }

        await dbManager.updateOne(
            { discordId: transfer.discordId },
            { $set: { transferDone: true } },
        );
    }

    console.log("All transfers have been completed.");

    process.exit(0);
});
