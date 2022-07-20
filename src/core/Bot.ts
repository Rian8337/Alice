import { lstat, readdir } from "fs/promises";
import { join } from "path";
import {
    ApplicationCommandData,
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    Snowflake,
} from "discord.js";
import { MongoClient } from "mongodb";
import consola, { Consola } from "consola";
import { SlashCommand } from "structures/core/SlashCommand";
import { Event } from "structures/core/Event";
import { TimeoutManager } from "@alice-utils/managers/TimeoutManager";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { EventUtil } from "structures/core/EventUtil";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Manager } from "@alice-utils/base/Manager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WarningManager } from "@alice-utils/managers/WarningManager";
import { ModalCommand } from "structures/core/ModalCommand";
import { BotInteractions } from "structures/core/BotInteractions";
import { ContextMenuCommand } from "structures/core/ContextMenuCommand";
import { Config } from "./Config";

/**
 * The starting point of the bot.
 *
 * Upon initialization, the bot will automatically log in.
 */
export class Bot extends Client<true> {
    /**
     * The logger of this bot.
     */
    readonly logger: Consola = consola;

    /**
     * The interactions that this bot has.
     */
    readonly interactions: BotInteractions = {
        chatInput: new Collection(),
        contextMenu: {
            message: new Collection(),
            user: new Collection(),
        },
        modalSubmit: new Collection(),
    };

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
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.User,
                Partials.Message,
                Partials.User,
                Partials.Message,
                Partials.Reaction,
                Partials.ThreadMember,
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

        await this.loadSlashCommands();
        await this.loadContextMenuCommands();
        await this.loadModalCommands();
        await this.loadEvents();
        await this.connectToDatabase();

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
     * Loads slash commands from `interactions/commands` directory.
     */
    private async loadSlashCommands(): Promise<void> {
        this.logger.info("Loading slash commands");

        const commandPath: string = join(
            __dirname,
            "..",
            "interactions",
            "commands"
        );

        const folders: string[] = await readdir(commandPath);

        let i = 0;

        for (const folder of folders) {
            this.logger.info("%d. Loading folder %s", ++i, folder);

            const commands: string[] = await readdir(join(commandPath, folder));

            let j = 0;

            for (const command of commands) {
                this.logger.success("%d.%d. %s loaded", i, ++j, command);

                const filePath: string = join(commandPath, folder, command);

                const file: SlashCommand = await import(
                    `${filePath}/${command}`
                );

                this.interactions.chatInput.set(command, {
                    ...file,
                    subcommandGroups: new Collection(),
                    subcommands: new Collection(),
                });

                await this.loadSlashSubcommandGroups(command, filePath);

                await this.loadSlashSubcommands(command, filePath);
            }
        }
    }

    /**
     * Loads slash subcommand groups from the specified directory and caches them.
     *
     * @param commandName The name of the command.
     * @param commandDirectory The directory of the command.
     */
    private async loadSlashSubcommandGroups(
        commandName: string,
        commandDirectory: string
    ): Promise<void> {
        const subcommandGroupPath: string = join(
            commandDirectory,
            "subcommandGroups"
        );
        let subcommandGroups: string[];

        try {
            subcommandGroups = await readdir(subcommandGroupPath);
        } catch {
            return;
        }

        const collection: Collection<string, SlashSubcommand> =
            this.interactions.chatInput.get(commandName)!.subcommandGroups;

        for (const subcommandGroup of subcommandGroups) {
            const filePath: string = `${subcommandGroupPath}/${subcommandGroup}`;

            const file: SlashSubcommand = await import(
                join(filePath, subcommandGroup)
            );

            collection.set(subcommandGroup, file);

            await this.loadSlashSubcommands(commandName, filePath);
        }
    }

    /**
     * Loads slash subcommands from the specified directory and caches them.
     *
     * @param commandName The name of the command.
     * @param commandDirectory The directory of the command.
     */
    private async loadSlashSubcommands(
        commandName: string,
        commandDirectory: string
    ): Promise<void> {
        const subcommandPath: string = join(commandDirectory, "subcommands");

        let subcommands: string[];

        try {
            subcommands = await readdir(subcommandPath);
        } catch {
            return;
        }

        const collection: Collection<string, SlashSubcommand> =
            this.interactions.chatInput.get(commandName)!.subcommands;

        for (const subcommand of subcommands.filter((v) => v.endsWith(".js"))) {
            const filePath: string = join(subcommandPath, subcommand);

            const fileStat = await lstat(filePath);

            if (fileStat.isDirectory()) {
                continue;
            }

            const file: SlashSubcommand = await import(filePath);

            collection.set(
                subcommand.substring(0, subcommand.length - 3),
                file
            );
        }
    }

    /**
     * Loads context menu commands from `interactions/contextmenus` directory.
     */
    private async loadContextMenuCommands(): Promise<void> {
        const commandPath: string = join(
            __dirname,
            "..",
            "interactions",
            "contextmenus"
        );

        const loadCommands = async (
            collection: Collection<string, ContextMenuCommand>,
            folder: string
        ): Promise<void> => {
            const commands: string[] = await readdir(join(commandPath, folder));

            this.logger.info("Loading %s context menu commands", folder);

            let i = 0;

            for (const command of commands.filter((v) => v.endsWith(".js"))) {
                this.logger.success(
                    "%d. %s loaded",
                    ++i,
                    command.substring(0, command.length - 3)
                );

                const file: ContextMenuCommand = await import(
                    join(commandPath, folder, command)
                );

                collection.set(file.config.name, file);
            }
        };

        await loadCommands(this.interactions.contextMenu.message, "message");

        await loadCommands(this.interactions.contextMenu.user, "user");
    }

    /**
     * Loads modal submit commands from `interactions/modals` directory.
     */
    private async loadModalCommands(): Promise<void> {
        this.logger.info("Loading modal submit commands");

        const commandPath: string = join(
            __dirname,
            "..",
            "interactions",
            "modals"
        );

        const folders: string[] = await readdir(commandPath);

        let i = 0;

        for (const folder of folders) {
            this.logger.info("%d. Loading folder %s", ++i, folder);

            const commands: string[] = await readdir(join(commandPath, folder));

            let j = 0;

            for (const command of commands.filter((v) => v.endsWith(".js"))) {
                this.logger.success(
                    "%d.%d. %s loaded",
                    i,
                    ++j,
                    command.substring(0, command.length - 3)
                );

                const file: ModalCommand = await import(
                    join(commandPath, folder, command)
                );

                this.interactions.modalSubmit.set(
                    command.substring(0, command.length - 3),
                    file
                );
            }
        }
    }

    /**
     * Loads events and event utilities from `events` directory.
     */
    private async loadEvents(): Promise<void> {
        this.logger.info("Loading events and event utilities");

        const eventsPath: string = join(__dirname, "..", "events");

        const events: string[] = await readdir(eventsPath);

        let i = 0;

        for (const event of events) {
            const file: Event = await import(join(eventsPath, event, event));

            super.on(event, file.run.bind(null, this));

            const eventUtils: string[] = await readdir(
                join(eventsPath, event, "utils")
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
                    join(eventsPath, event, "utils", eventUtil)
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

            const command: SlashCommand =
                this.interactions.chatInput.get(name)!;

            const data: ApplicationCommandData = {
                name: command.config.name,
                description: command.config.description,
                options: command.config.options,
            };

            const applicationCommand = await this.application.commands.create(
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
            !(await this.application.commands.fetch(deployCommandID))
        ) {
            await registerCommand("deploy");
        }

        if (
            forceRegister ||
            !(await this.application.commands.fetch(undeployCommandID))
        ) {
            await registerCommand("undeploy");
        }
    }
}
