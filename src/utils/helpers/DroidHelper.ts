import { Config } from "@alice-core/Config";
import { officialPool } from "@alice-database/official/OfficialDatabasePool";
import {
    constructOfficialDatabaseTable,
    OfficialDatabaseTables,
} from "@alice-database/official/OfficialDatabaseTables";
import { OfficialDatabaseScore } from "@alice-database/official/schema/OfficialDatabaseScore";
import { OfficialDatabaseUser } from "@alice-database/official/schema/OfficialDatabaseUser";
import { OfficialDatabaseScoreMods } from "@alice-structures/utils/OfficialDatabaseScoreMods";
import { DroidAPIRequestBuilder, ModUtil } from "@rian8337/osu-base";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { RowDataPacket } from "mysql2";

/**
 * A helper for osu!droid related requests.
 */
export abstract class DroidHelper {
    /**
     * Retrieves the leaderboard of a beatmap.
     *
     * In debug mode, the osu!droid API will be requested. Otherwise, the official database will be queried.
     *
     * @param hash The MD5 hash of the beatmap.
     * @param page The page to retrieve. Defaults to 1.
     * @param scoresPerPage The amount of scores to retrieve per page. Only used when the database is queried. Defaults to 100.
     * @param databaseColumns The columns to retrieve from the database if the database is queried.
     * @returns The leaderboard.
     */
    static async getLeaderboard<K extends keyof OfficialDatabaseScore>(
        hash: string,
        page: number = 1,
        scoresPerPage: number = 100,
        databaseColumns?: K[],
    ): Promise<Pick<OfficialDatabaseScore, K>[] | Score[]> {
        if (Config.isDebug) {
            const apiRequestBuilder = new DroidAPIRequestBuilder()
                .setEndpoint("scoresearchv2.php")
                .addParameter("hash", hash)
                .addParameter("page", Math.max(0, page - 1))
                .addParameter("order", "score");

            const result = await apiRequestBuilder.sendRequest();

            if (result.statusCode !== 200) {
                throw new Error("Droid API request failed");
            }

            const data = result.data.toString("utf-8").split("<br>");

            data.shift();

            return data.map((v) => new Score().fillInformation(v));
        }

        const leaderboardQuery = await officialPool.query<RowDataPacket[]>(
            `SELECT ${
                databaseColumns?.join() || "*"
            } FROM ${constructOfficialDatabaseTable(
                OfficialDatabaseTables.score,
            )} WHERE hash = ? AND score > 0 ORDER BY score DESC LIMIT ? OFFSET ?;`,
            [hash, scoresPerPage, (page - 1) * scoresPerPage],
        );

        return leaderboardQuery[0] as OfficialDatabaseScore[];
    }

    /**
     * Gets recent scores of a player from the official database.
     *
     * In debug mode, this always returns an empty array.
     *
     * @param uid The uid of the player.
     * @param amount The amount of scores to retrieve. Defaults to 50.
     * @param offset The offset of the scores to retrieve. Defaults to 0.
     * @param databaseColumns The columns to retrieve from the database if the database is queried. Defaults to all columns.
     * @returns The recent scores.
     */
    static async getRecentScores<K extends keyof OfficialDatabaseScore>(
        uid: number,
        amount: number = 50,
        offset: number = 0,
        databaseColumns?: K[],
    ): Promise<Pick<OfficialDatabaseScore, K>[]> {
        if (Config.isDebug) {
            return [];
        }

        const scoreQuery = await officialPool.query<RowDataPacket[]>(
            `SELECT ${
                databaseColumns?.join() || "*"
            } FROM ${constructOfficialDatabaseTable(
                OfficialDatabaseTables.score,
            )} WHERE uid = ? AND score > 0 ORDER BY date DESC LIMIT ? OFFSET ?;`,
            [uid, amount, offset],
        );

        return scoreQuery[0] as OfficialDatabaseScore[];
    }

    /**
     * Gets a player's information from their uid or username.
     *
     * In debug mode, the osu!droid API will be requested. Otherwise, the official database will be queried.
     *
     * @param uidOrUsername The uid or username of the player.
     * @param databaseColumns The columns to retrieve from the database if the database is queried. Defaults to all columns.
     * @returns The player's information, `null` if not found.
     */
    static async getPlayer<K extends keyof OfficialDatabaseUser>(
        uidOrUsername: string | number,
        databaseColumns?: K[],
    ): Promise<Pick<OfficialDatabaseUser, K> | Player | null> {
        if (Config.isDebug) {
            return Player.getInformation(uidOrUsername);
        }

        const playerQuery = await officialPool.query<RowDataPacket[]>(
            `SELECT ${
                databaseColumns?.join() || "*"
            } FROM ${constructOfficialDatabaseTable(
                OfficialDatabaseTables.user,
            )} WHERE ${
                typeof uidOrUsername === "number" ? "id" : "username"
            } = ?;`,
            [uidOrUsername],
        );

        return (playerQuery[0] as OfficialDatabaseUser[]).at(0) ?? null;
    }

    /**
     * Obtains a rank from the official database based on a score.
     *
     * In debug mode, this will return `null`.
     *
     * @param score The score to get the rank from.
     * @returns The rank of the player, `null` if not found.
     */
    static async getPlayerRank(score: number): Promise<number | null> {
        if (Config.isDebug) {
            return null;
        }

        const rankQuery = await officialPool.query<RowDataPacket[]>(
            `SELECT COUNT(*) + 1 FROM ${constructOfficialDatabaseTable(
                OfficialDatabaseTables.user,
            )} WHERE score > ?;`,
            [score],
        );

        return (
            (rankQuery[0] as { "COUNT(*) + 1": number }[]).at(0)?.[
                "COUNT(*) + 1"
            ] ?? null
        );
    }

    /**
     * Gets a score from a player on a beatmap.
     *
     * In debug mode, the osu!droid API will be requested. Otherwise, the official database will be queried.
     *
     * @param uid The uid of the player.
     * @param hash The MD5 hash of the beatmap.
     * @param databaseColumns The columns to retrieve from the database if the database is queried. Defaults to
     * @returns The score, `null` if not found.
     */
    static async getScore<K extends keyof OfficialDatabaseScore>(
        uid: number,
        hash: string,
        databaseColumns?: K[],
    ): Promise<Pick<OfficialDatabaseScore, K> | Score | null> {
        if (Config.isDebug) {
            return Score.getFromHash(uid, hash);
        }

        const scoreQuery = await officialPool.query<RowDataPacket[]>(
            `SELECT ${
                databaseColumns?.join() || "*"
            } FROM ${constructOfficialDatabaseTable(
                OfficialDatabaseTables.score,
            )} WHERE uid = ? AND hash = ? AND score > 0;`,
            [uid, hash],
        );

        return (scoreQuery[0] as OfficialDatabaseScore[]).at(0) ?? null;
    }

    /**
     * Gets scores from a player.
     *
     * @param uid The uid of the player.
     * @param page The page to retrieve. Defaults to 1.
     * @param scoresPerPage The amount of scores to retrieve per page. Defaults to 100.
     * @param order The order of the scores. Defaults to the ID of the score.
     * @param databaseColumns The columns to retrieve from the database if the database is queried. Defaults to all columns.
     * @returns The scores.
     */
    static async getScores<K extends keyof OfficialDatabaseScore>(
        uid: number,
        page: number = 1,
        scoresPerPage: number = 100,
        order: keyof OfficialDatabaseScore = "id",
        databaseColumns?: K[],
    ): Promise<Pick<OfficialDatabaseScore, K>[] | Score[]> {
        if (Config.isDebug) {
            const apiRequestBuilder = new DroidAPIRequestBuilder()
                .setEndpoint("scoresearchv2.php")
                .addParameter("uid", uid)
                .addParameter("page", page - 1);

            const data = await apiRequestBuilder.sendRequest();

            if (data.statusCode !== 200) {
                return [];
            }

            const entries = data.data.toString("utf-8").split("<br>");

            entries.shift();

            return entries.map((v) => new Score().fillInformation(v));
        }

        const scoreQuery = await officialPool.query<RowDataPacket[]>(
            `SELECT ${
                databaseColumns?.join() || "*"
            } FROM ${constructOfficialDatabaseTable(
                OfficialDatabaseTables.score,
            )} WHERE uid = ? AND score > 0 ORDER BY ? DESC LIMIT ? OFFSET ?;`,
            [uid, order, scoresPerPage, (page - 1) * scoresPerPage],
        );

        return scoreQuery[0] as OfficialDatabaseScore[];
    }

    /**
     * Parses the mods of a score.
     *
     * @param modstring The raw string of mods received from score table.
     * @returns The parsed mods.
     */
    static parseMods(modstring: string): OfficialDatabaseScoreMods {
        // Taken directly from osu! core module.
        const modstrings = modstring.split("|");
        let actualMods = "";
        let speedMultiplier = 1;
        let forceCS: number | undefined;
        let forceAR: number | undefined;
        let forceOD: number | undefined;
        let forceHP: number | undefined;
        let flashlightFollowDelay: number | undefined;

        for (const str of modstrings) {
            if (!str) {
                continue;
            }

            switch (true) {
                // Forced stats
                case str.startsWith("CS"):
                    forceCS = parseFloat(str.replace("CS", ""));
                    break;
                case str.startsWith("AR"):
                    forceAR = parseFloat(str.replace("AR", ""));
                    break;
                case str.startsWith("OD"):
                    forceOD = parseFloat(str.replace("OD", ""));
                    break;
                case str.startsWith("HP"):
                    forceHP = parseFloat(str.replace("HP", ""));
                    break;
                // FL follow delay
                case str.startsWith("FLD"):
                    flashlightFollowDelay = parseFloat(str.replace("FLD", ""));
                    break;
                // Speed multiplier
                case str.startsWith("x"):
                    speedMultiplier = parseFloat(str.replace("x", ""));
                    break;
                default:
                    actualMods += str;
            }
        }

        return {
            mods: ModUtil.droidStringToMods(actualMods),
            speedMultiplier,
            forceCS,
            forceAR,
            forceOD,
            forceHP,
            flashlightFollowDelay,
            oldStatistics: !modstring.includes("|"),
        };
    }

    /**
     * Converts a mods object to a database string.
     *
     * @param mods The mods object.
     * @returns The database string.
     */
    static modsToDatabaseString(mods: OfficialDatabaseScoreMods): string {
        let str = mods.mods.map((v) => v.acronym).join("");

        if (!mods.oldStatistics) {
            str += "|";
        }

        if (mods.speedMultiplier !== 1) {
            str += `${mods.speedMultiplier}x|`;
        }

        if (mods.forceCS !== undefined) {
            str += `CS${mods.forceCS}|`;
        }

        if (mods.forceAR !== undefined) {
            str += `AR${mods.forceAR}|`;
        }

        if (mods.forceOD !== undefined) {
            str += `OD${mods.forceOD}|`;
        }

        if (mods.forceHP !== undefined) {
            str += `HP${mods.forceHP}|`;
        }

        if (mods.flashlightFollowDelay !== undefined) {
            str += `FLD${mods.flashlightFollowDelay}|`;
        }

        return str.endsWith("|") ? str.slice(0, -1) : str;
    }

    /**
     * Gets the complete mod string of a score (mods, speed multiplier, force CS, force AR, force OD, and force HP combined).
     *
     * @param score The score.
     * @returns The complete mod string.
     */
    static getCompleteModString(modstring: string): string {
        const parsedMods = this.parseMods(modstring);

        let finalString = `+${
            parsedMods.mods.length > 0
                ? parsedMods.mods.map((v) => v.acronym)
                : "No Mod"
        }`;

        const customStats: string[] = [];

        if (parsedMods.speedMultiplier !== 1) {
            customStats.push(`${parsedMods.speedMultiplier}x`);
        }

        if (parsedMods.forceAR !== undefined) {
            customStats.push(`AR${parsedMods.forceAR}`);
        }

        if (parsedMods.forceOD !== undefined) {
            customStats.push(`OD${parsedMods.forceOD}`);
        }

        if (parsedMods.forceCS !== undefined) {
            customStats.push(`CS${parsedMods.forceCS}`);
        }

        if (parsedMods.forceHP !== undefined) {
            customStats.push(`HP${parsedMods.forceHP}`);
        }

        if (parsedMods.flashlightFollowDelay !== undefined) {
            customStats.push(`FLD${parsedMods.flashlightFollowDelay}`);
        }

        if (customStats.length > 0) {
            finalString += ` (${customStats.join(", ")})`;
        }

        return finalString;
    }

    /**
     * Gets the avatar URL of a player.
     *
     * @param uid The uid of the player.
     * @returns The avatar URL.
     */
    static getAvatarURL(uid: number): string {
        return `https://osudroid.moe/user/avatar?id=${uid}`;
    }

    /**
     * Cleans up filenames received from the score table to a proper title.
     *
     * @param filename The filename to clean up.
     * @returns The cleaned up filename.
     */
    static cleanupFilename(filename: string): string {
        return filename.substring(0, filename.length - 4).replace(/_/g, " ");
    }
}
