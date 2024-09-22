import { DatabaseManager } from "@alice-database/DatabaseManager";
import { officialPool } from "@alice-database/official/OfficialDatabasePool";
import {
    constructOfficialDatabaseTable,
    OfficialDatabaseTables,
} from "@alice-database/official/OfficialDatabaseTables";

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

    for (const transfer of transfers.values()) {
        const connection = await officialPool.getConnection();

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

        const scoreTable = scoreTables[0];
        const valuesArr = [transfer.transferUid, transfer.transferUid];

        await connection.query(
            `UPDATE ${userTable} SET score = (SELECT SUM(score) FROM ${scoreTable} WHERE uid = ?) WHERE id = ?`,
            valuesArr,
        );

        await connection.query(
            `UPDATE ${userTable} SET accuracy = (SELECT SUM(accuracy) FROM ${scoreTable} WHERE uid = ?) WHERE id = ?`,
            valuesArr,
        );

        await connection.query(
            `UPDATE ${userTable} SET playcount = (SELECT COUNT(*) FROM ${scoreTable} WHERE uid = ? AND score > 0) WHERE id = ?`,
            valuesArr,
        );

        await connection.commit();

        connection.release();

        await dbManager.updateOne(
            { discordId: transfer.discordId },
            { $set: { transferDone: true } },
        );

        console.log(`Transfer for ${transfer.discordId} has been completed.`);
    }

    console.log("All transfers have been completed.");

    process.exit(0);
});
