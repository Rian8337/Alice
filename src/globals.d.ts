/* eslint-disable @typescript-eslint/no-unused-vars */

namespace NodeJS {
    interface ProcessEnv {
        /**
         * The debug bot token.
         */
        readonly DEBUG_BOT_TOKEN?: string;

        /**
         * The bot token.
         */
        readonly BOT_TOKEN?: string;

        /**
         * The API key for osu! API.
         */
        readonly OSU_API_KEY?: string;

        /**
         * The API key for osu!droid API.
         */
        readonly DROID_API_KEY?: string;

        /**
         * The API key for Tatsu API.
         */
        readonly TATSU_API_KEY?: string;

        /**
         * The API key for YouTube API.
         */
        readonly YOUTUBE_API_KEY?: string;

        /**
         * The database key for Elaina database.
         */
        readonly ELAINA_DB_KEY?: string;

        /**
         * The database key for Alice database.
         */
        readonly ALICE_DB_KEY?: string;

        /**
         * The debug bot's deploy command ID.
         */
        readonly DEBUG_BOT_DEPLOY_ID?: string;

        /**
         * The debug bot's undeploy command ID.
         */
        readonly DEBUG_BOT_UNDEPLOY_ID?: string;

        /**
         * The bot's deploy command ID.
         */
        readonly BOT_DEPLOY_ID?: string;

        /**
         * The bot's undeploy command ID.
         */
        readonly BOT_UNDEPLOY_ID?: string;

        /**
         * The API key for the osu!droid server.
         */
        readonly DROID_SERVER_INTERNAL_KEY?: string;

        /**
         * The API key for the Discord OAuth2 backend.
         */
        readonly DISCORD_OAUTH_BACKEND_INTERNAL_KEY?: string;

        /**
         * The hostname of the database for the official server.
         */
        readonly OFFICIAL_DB_HOSTNAME?: string;

        /**
         * The port of the database for the official server.
         */
        readonly OFFICIAL_DB_USERNAME?: string;

        /**
         * The username of the database for the official server.
         */
        readonly OFFICIAL_DB_PASSWORD?: string;

        /**
         * The password of the database for the official server.
         */
        readonly OFFICIAL_DB_NAME?: string;

        /**
         * The prefix of database names in the official server's database.
         */
        readonly OFFICIAL_DB_PREFIX?: string;

        /**
         * The rework type that is being hosted.
         */
        readonly CURRENT_REWORK_TYPE?: string;
    }
}
