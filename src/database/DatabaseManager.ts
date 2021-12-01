import { Db } from "mongodb";
import { AliceDBCollection } from "./AliceDBCollection";
import { ElainaDBCollection } from "./ElainaDBCollection";

/**
 * A manager for database.
 */
export abstract class DatabaseManager {
    /**
     * Manager for Elaina DB.
     */
    static elainaDb: {
        /**
         * The instance of the database.
         */
        instance: Db;

        /**
         * The collections from Elaina DB.
         */
        collections: ElainaDBCollection;
    };

    /**
     * Manager for Alice DB.
     */
    static aliceDb: {
        /**
         * The instance of the database.
         */
        instance: Db;

        /**
         * The collections from Alice DB.
         */
        collections: AliceDBCollection;
    };

    /**
     * Initializes the manager.
     *
     * @param elainaDb The database that is shared with the old bot (Nero's database).
     * @param aliceDb The database that is only used by this bot (my database).
     */
    static init(elainaDb: Db, aliceDb: Db) {
        this.elainaDb = {
            instance: elainaDb,
            collections: new ElainaDBCollection(elainaDb),
        };

        this.aliceDb = {
            instance: aliceDb,
            collections: new AliceDBCollection(aliceDb),
        };
    }
}
