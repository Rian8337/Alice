import { config } from "dotenv";
import { createPool } from "mysql2/promise";

config();

/**
 * The game's database connection.
 */
export const officialPool = createPool({
    user: process.env.OFFICIAL_DB_USERNAME,
    host: process.env.OFFICIAL_DB_HOSTNAME,
    database: process.env.OFFICIAL_DB_NAME,
    password: process.env.OFFICIAL_DB_PASSWORD,
    port: parseInt(process.env.OFFICIAL_DB_PORT ?? "") || undefined,
});
