import { Db, MongoClient } from "mongodb";
import { consola } from "consola";
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
     */
    static async init(): Promise<void> {
        await this.initElainaDB();
        await this.initAliceDB();
    }

    private static async initElainaDB(): Promise<void> {
        const elainaURI: string =
            "mongodb://" +
            process.env.ELAINA_DB_KEY +
            "@elainadb-shard-00-00-r6qx3.mongodb.net:27017,elainadb-shard-00-01-r6qx3.mongodb.net:27017,elainadb-shard-00-02-r6qx3.mongodb.net:27017/test?ssl=true&replicaSet=ElainaDB-shard-0&authSource=admin&retryWrites=true";
        const elainaDb: MongoClient = await new MongoClient(
            elainaURI
        ).connect();

        consola.success("Connection to Elaina DB established");

        const db: Db = elainaDb.db("ElainaDB");

        this.elainaDb = {
            instance: db,
            collections: new ElainaDBCollection(db),
        };
    }

    private static async initAliceDB(): Promise<void> {
        const aliceURI: string =
            "mongodb+srv://" +
            process.env.ALICE_DB_KEY +
            "@alicedb-hoexz.gcp.mongodb.net/test?retryWrites=true&w=majority";
        const aliceDb: MongoClient = await new MongoClient(aliceURI).connect();

        consola.success("Connection to Alice DB established");

        const db: Db = aliceDb.db("AliceDB");

        this.aliceDb = {
            instance: db,
            collections: new AliceDBCollection(db),
        };
    }
}
