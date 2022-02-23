import * as fs from "fs/promises";
import { url } from "inspector";
import {
    ApplicationCommandData,
    Client,
    Collection,
    Intents,
    Snowflake,
} from "discord.js";
import { MongoClient } from "mongodb";
import consola, { Consola } from "consola";
import { Command } from "@alice-interfaces/core/Command";
import { Event } from "@alice-interfaces/core/Event";
import { TimeoutManager } from "@alice-utils/managers/TimeoutManager";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Config } from "./Config";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Manager } from "@alice-utils/base/Manager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WarningManager } from "@alice-utils/managers/WarningManager";

/**
 * The starting point of the bot.
 *
 * Upon initialization, the bot will automatically log in.
 */
export class Bot extends Client {
    /**
     * The logger of this bot.
     */
    readonly logger: Consola = consola;

    /**
     * The commands that this bot has, mapped by the name of the command.
     */
    readonly commands: Collection<string, Command> = new Collection();

    /**
     * The subcommand groups that this bot has, mapped by the name of the command,
     * and each subcommand group mapped by its name.
     */
    readonly subcommandGroups: Collection<
        string,
        Collection<string, Subcommand>
    > = new Collection();

    /**
     * The subcommands that this bot has, either mapped by the
     * name of the command or the name of the subcommand group,
     * and each subcommand mapped by its name.
     */
    readonly subcommands: Collection<string, Collection<string, Subcommand>> =
        new Collection();

    /**
     * The event utilities that this bot has, mapped by the event's name, and each utility mapped by its name.
     */
    readonly eventUtilities: Collection<string, Collection<string, EventUtil>> =
        new Collection();

    /**
     * Whether the bot has been initialized.
     */
    private isInitialized: boolean = false;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
            ],
            partials: [
                "CHANNEL",
                "GUILD_MEMBER",
                "USER",
                "MESSAGE",
                "REACTION",
            ],
        });

        Manager.init(this);
    }

    /**
     * Initializes the bot.
     */
    async start(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;

        this.logger.wrapAll();

        Config.isDebug = !!url();

        await this.connectToDatabase();
        await this.loadCommands();
        await this.loadEvents();

        await super.login(
            Config.isDebug ? process.env.DEBUG_BOT_TOKEN : process.env.BOT_TOKEN
        );

        await this.initUtils();
        await this.registerDeployCommands();

        this.logger.success("Discord API connection established");
        this.logger.success("Alice Synthesis Thirty is up and running");
    }

    /**
     * Connects to the bot's databases.
     */
    private async connectToDatabase(): Promise<void> {
        // Elaina DB
        const elainaURI: string =
            "mongodb://" +
            process.env.ELAINA_DB_KEY +
            "@elainadb-shard-00-00-r6qx3.mongodb.net:27017,elainadb-shard-00-01-r6qx3.mongodb.net:27017,elainadb-shard-00-02-r6qx3.mongodb.net:27017/test?ssl=true&replicaSet=ElainaDB-shard-0&authSource=admin&retryWrites=true";
        const elainaDb: MongoClient = await new MongoClient(
            elainaURI
        ).connect();
        this.logger.success("Connection to Elaina DB established");

        // Alice DB
        const aliceURI: string =
            "mongodb+srv://" +
            process.env.ALICE_DB_KEY +
            "@alicedb-hoexz.gcp.mongodb.net/test?retryWrites=true&w=majority";
        const aliceDb: MongoClient = await new MongoClient(aliceURI).connect();
        this.logger.success("Connection to Alice DB established");

        DatabaseManager.init(elainaDb.db("ElainaDB"), aliceDb.db("AliceDB"));
    }

    /**
     * Loads commands from `commands` directory.
     */
    private async loadCommands(): Promise<void> {
        this.logger.info("Loading commands");

        const commandPath: string = `${__dirname}/../commands`;

        const folders: string[] = await fs.readdir(commandPath);

        let i = 0;

        for (const folder of folders) {
            this.logger.info("%d. Loading folder %s", ++i, folder);

            const commands: string[] = await fs.readdir(
                `${commandPath}/${folder}`
            );

            let j = 0;

            for (const command of commands) {
                this.logger.success("%d.%d. %s loaded", i, ++j, command);

                const filePath: string = `${commandPath}/${folder}/${command}`;

                const file: Command = await import(`${filePath}/${command}`);

                this.commands.set(command, file);

                await this.loadSubcommandGroups(command, filePath);

                await this.loadSubcommands(command, filePath);
            }
        }
    }

    /**
     * Loads subcommand groups from the specified directory and caches them.
     *
     * @param commandName The name of the command.
     * @param commandDirectory The directory of the command.
     */
    private async loadSubcommandGroups(
        commandName: string,
        commandDirectory: string
    ): Promise<void> {
        const subcommandGroupPath: string = `${commandDirectory}/subcommandGroups`;

        let subcommandGroups: string[];

        try {
            subcommandGroups = await fs.readdir(subcommandGroupPath);
        } catch {
            return;
        }

        const collection: Collection<string, Subcommand> = new Collection();

        for (const subcommandGroup of subcommandGroups) {
            const filePath: string = `${subcommandGroupPath}/${subcommandGroup}`;

            const file: Subcommand = await import(
                `${filePath}/${subcommandGroup}`
            );

            collection.set(subcommandGroup, file);

            await this.loadSubcommands(subcommandGroup, filePath);
        }

        this.subcommandGroups.set(commandName, collection);
    }

    /**
     * Loads subcommands from the specified directory and caches them.
     *
     * @param commandName The name of the command.
     * @param commandDirectory The directory of the command.
     */
    private async loadSubcommands(
        commandName: string,
        commandDirectory: string
    ): Promise<void> {
        const subcommandPath: string = `${commandDirectory}/subcommands`;

        let subcommands: string[];

        try {
            subcommands = await fs.readdir(subcommandPath);
        } catch {
            return;
        }

        const collection: Collection<string, Subcommand> = new Collection();

        for (const subcommand of subcommands.filter((v) => v.endsWith(".js"))) {
            const filePath: string = `${subcommandPath}/${subcommand}`;

            const fileStat = await fs.lstat(filePath);

            if (fileStat.isDirectory()) {
                continue;
            }

            const file: Subcommand = await import(filePath);

            collection.set(
                subcommand.substring(0, subcommand.length - 3),
                file
            );
        }

        this.subcommands.set(commandName, collection);
    }

    /**
     * Loads events and event utilities from `events` directory.
     */
    private async loadEvents(): Promise<void> {
        this.logger.info("Loading events and event utilities");

        const eventsPath: string = `${__dirname}/../events`;

        const events: string[] = await fs.readdir(eventsPath);

        let i = 0;

        for (const event of events) {
            const file: Event = await import(`${eventsPath}/${event}/${event}`);

            super.on(event, file.run.bind(null, this));

            const eventUtils: string[] = await fs.readdir(
                `${eventsPath}/${event}/utils`
            );

            this.eventUtilities.set(event, new Collection());

            ++i;

            let j = 0;

            for (const eventUtil of eventUtils
                .filter((v) => v.endsWith(".js"))
                .map((v) => v.substring(0, v.length - 3))) {
                this.logger.success(
                    "%d.%d. %s :: %s event utility loaded",
                    i,
                    ++j,
                    event,
                    eventUtil
                );

                const eventUtility: EventUtil = await import(
                    `${eventsPath}/${event}/utils/${eventUtil}`
                );

                this.eventUtilities.get(event)!.set(eventUtil, eventUtility);
            }
        }
    }

    /**
     * Initializes utilities.
     */
    private async initUtils(): Promise<void> {
        ProfileManager.init();
        await CommandUtilManager.init();
        await LoungeLockManager.init();
        TimeoutManager.init();
        WarningManager.init();
        await WhitelistManager.init();
    }

    /**
     * Registers deploy and undeploy commands to register other commands.
     *
     * @param forceRegister Whether to force register the commands.
     */
    private async registerDeployCommands(
        forceRegister?: boolean
    ): Promise<void> {
        if (!this.application?.owner) {
            await this.application?.fetch();
        }

        const deployCommandID: Snowflake = <Snowflake>(
            (Config.isDebug
                ? process.env.DEBUG_BOT_DEPLOY_ID
                : process.env.BOT_DEPLOY_ID)
        );
        const undeployCommandID: Snowflake = <Snowflake>(
            (Config.isDebug
                ? process.env.DEBUG_BOT_UNDEPLOY_ID
                : process.env.BOT_UNDEPLOY_ID)
        );

        const registerCommand = async (name: string): Promise<void> => {
            this.logger.info(`Registering ${name} command`);

            const command: Command = <Command>this.commands.get(name);

            const data: ApplicationCommandData = {
                name: command.config.name,
                description: command.config.description,
                options: command.config.options,
                defaultPermission: true,
            };

            const applicationCommand = await this.application?.commands.create(
                data
            );

            this.logger.info(
                `Command ${name} registered with ID ${applicationCommand?.id}`
            );

            this.logger.info(
                `${StringHelper.capitalizeString(name)} command registered`
            );
        };

        if (
            forceRegister ||
            !(await this.application!.commands.fetch(deployCommandID))
        ) {
            await registerCommand("deploy");
        }

        if (
            forceRegister ||
            !(await this.application!.commands.fetch(undeployCommandID))
        ) {
            await registerCommand("undeploy");
        }
    }
}
