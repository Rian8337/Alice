import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildSettings } from "@alice-database/utils/aliceDb/GuildSettings";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DisabledCommand } from "@alice-interfaces/moderation/DisabledCommand";
import { DisabledEventUtil } from "@alice-interfaces/moderation/DisabledEventUtil";
import { GuildChannelSettings } from "@alice-interfaces/moderation/GuildChannelSettings";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Collection, NewsChannel, Snowflake, TextChannel } from "discord.js";

/**
 * A manager for commands and utilities.
 */
export abstract class CommandUtilManager extends Manager {
    /**
     * The commands that are disabled in channels, mapped by channel ID.
     */
    static readonly channelDisabledCommands: Collection<Snowflake, Collection<string, DisabledCommand>> = new Collection();

    /**
     * The commands that are disabled in guilds, mapped by guild ID.
     */
    static readonly guildDisabledCommands: Collection<Snowflake, Collection<string, DisabledCommand>> = new Collection();

    /**
     * The commands that are globally disabled, mapped by their name.
     */
    static readonly globallyDisabledCommands: Collection<string, number> = new Collection();

    /**
     * The global cooldown for all commands.
     */
    static globalCommandCooldown: number = 0;

    /**
     * The event utilities that are disabled in channels, mapped by channel ID.
     */
    static readonly channelDisabledEventUtils: Collection<Snowflake, DisabledEventUtil[]> = new Collection();

    /**
     * The event utilities that are disabled in guilds, mapped by guild ID.
     */
    static readonly guildDisabledEventUtils: Collection<Snowflake, DisabledEventUtil[]> = new Collection();

    /**
     * The event utilities that are globally disabled, mapped by their event.
     */
    static readonly globallyDisabledEventUtils: Collection<string, string[]> = new Collection();

    /**
     * Initializes the manager.
     */
    static override async init(): Promise<void> {
        const guildSettings: Collection<string, GuildSettings> = await DatabaseManager.aliceDb.collections.guildSettings.get("id", {});

        for (const guildSetting of guildSettings.values()) {
            this.guildDisabledCommands.set(guildSetting.id, guildSetting.disabledCommands);
            this.guildDisabledEventUtils.set(guildSetting.id, guildSetting.disabledEventUtils);

            for (const channelSetting of guildSetting.channelSettings.values()) {
                this.channelDisabledCommands.set(channelSetting.id, ArrayHelper.arrayToCollection(channelSetting.disabledCommands, "name"));
                this.channelDisabledEventUtils.set(channelSetting.id, channelSetting.disabledEventUtils);
            }
        }
    }

    /**
     * Disables an event utility in a channel.
     * 
     * @param channel The channel.
     * @param event The name of the event.
     * @param utility The name of the event utility.
     * @returns An object containing information about database operation.
     */
    static async disableUtilityInChannel(channel: TextChannel | NewsChannel, event: string, utility: string): Promise<OperationResult> {
        const channelEventUtilSettings: DisabledEventUtil[] | undefined = this.channelDisabledEventUtils.get(channel.id);

        if (channelEventUtilSettings) {
            if (channelEventUtilSettings.find(v => v.event === event && v.name === utility)) {
                return this.createOperationResult(true);
            }

            channelEventUtilSettings.push({ name: event, event: utility });

            const guildSettings: GuildSettings =
                (await DatabaseManager.aliceDb.collections.guildSettings.getGuildSetting(channel.guildId))!;

            const channelSettings = guildSettings.channelSettings;

            channelSettings.get(channel.id)!.disabledEventUtils.push({
                name: event,
                event: utility
            });

            return DatabaseManager.aliceDb.collections.guildSettings.update(
                { id: channel.guildId },
                { 
                    $set: {
                        channelSettings: [...channelSettings.values()]
                    }
                }
            );
        } else {
            this.channelDisabledEventUtils.set(channel.id, [{ name: event, event: utility }]);

            const guildSettings: GuildSettings | null =
                await DatabaseManager.aliceDb.collections.guildSettings.getGuildSetting(channel.guildId);

            const channelSettings: Collection<Snowflake, GuildChannelSettings> = guildSettings?.channelSettings ?? new Collection();

            const channelSetting: GuildChannelSettings = channelSettings.get(channel.id) ?? 
                { id: channel.id, disabledCommands: [], disabledEventUtils: [] };

            channelSetting.disabledEventUtils.push({
                event: event,
                name: utility
            });

            channelSettings.set(channel.id, channelSetting);

            return DatabaseManager.aliceDb.collections.guildSettings.update(
                { id: channel.guildId },
                { 
                    $set: {
                        channelSettings: [...channelSettings.values()]
                    },
                    $setOnInsert: {
                        disabledEventUtils: [],
                        disabledCommands: []
                    }
                },
                { upsert: true }
            );
        }
    }

    /**
     * Disables an event utility in a guild.
     * 
     * @param guildId The ID of the guild.
     * @param event The name of the event.
     * @param utility The name of the event utility.
     * @returns An object containing information about the operation.
     */
    static async disableUtilityInGuild(guildId: Snowflake, event: string, utility: string): Promise<OperationResult> {
        const guildEventUtilSettings: DisabledEventUtil[] = this.guildDisabledEventUtils.get(guildId) ?? [];

        if (guildEventUtilSettings.find(v => v.event === event && v.name === utility)) {
            return this.createOperationResult(true);
        }

        guildEventUtilSettings.push({
            event: event,
            name: utility
        });

        this.guildDisabledEventUtils.set(guildId, guildEventUtilSettings);

        return DatabaseManager.aliceDb.collections.guildSettings.update(
            { id: guildId },
            {
                $set: {
                    disabledEventUtils: guildEventUtilSettings
                },
                $setOnInsert: {
                    channelSettings: [],
                    disabledCommands: []
                }
            },
            { upsert: true }
        );
    }

    /**
     * Disables an event utility globally.
     * 
     * @param event The name of the event.
     * @param utility The name of the event utility.
     */
    static disableUtilityGlobally(event: string, utility: string): void {
        const disabledUtilities: string[] = this.globallyDisabledEventUtils.get(event) ?? [];

        disabledUtilities.push(utility);

        this.globallyDisabledEventUtils.set(event, disabledUtilities);
    }

    /**
     * Enables an event utility in a channel.
     * 
     * @param channel The channel.
     * @param event The name of the event.
     * @param utility The name of the event utility.
     * @returns An object containing information about the operation.
     */
    static async enableUtilityInChannel(channel: TextChannel | NewsChannel, event: string, utility: string): Promise<OperationResult> {
        const channelEventUtilSettings: DisabledEventUtil[] | undefined = this.channelDisabledEventUtils.get(channel.id);

        if (!channelEventUtilSettings) {
            return this.createOperationResult(true);
        }

        const settingIndex: number = channelEventUtilSettings.findIndex(v => v.event === event && v.name === utility);

        if (settingIndex === -1) {
            return this.createOperationResult(true);
        }

        channelEventUtilSettings.splice(settingIndex, 1);

        const guildSettings: GuildSettings =
            (await DatabaseManager.aliceDb.collections.guildSettings.getGuildSetting(channel.guildId))!;

        const channelSettings: Collection<Snowflake, GuildChannelSettings> = guildSettings.channelSettings;

        channelSettings.get(channel.id)!.disabledEventUtils.push({
            event: event,
            name: utility
        });

        return DatabaseManager.aliceDb.collections.guildSettings.update(
            { id: channel.guildId },
            { 
                $set: {
                    channelSettings: [...channelSettings.values()]
                }
            }
        );
    }

    /**
     * Enables an event utility in a guild.
     * 
     * @param guildId The ID of the guild.
     * @param event The name of the event.
     * @param utility The name of the event utility.
     * @returns An object containing information about the operation.
     */
    static async enableUtilityInGuild(guildId: Snowflake, event: string, utility: string): Promise<OperationResult> {
        const guildEventUtilSettings: DisabledEventUtil[] | undefined = this.guildDisabledEventUtils.get(guildId);

        if (!guildEventUtilSettings) {
            return this.createOperationResult(true);
        }

        const settingIndex: number = guildEventUtilSettings.findIndex(v => v.event === event && v.name === utility);

        if (settingIndex === -1) {
            return this.createOperationResult(true);
        }

        guildEventUtilSettings.splice(settingIndex, 1);

        this.guildDisabledEventUtils.set(guildId, guildEventUtilSettings);

        return DatabaseManager.aliceDb.collections.guildSettings.update(
            { id: guildId },
            {
                $set: {
                    disabledEventUtils: guildEventUtilSettings
                }
            }
        );
    }

    /**
     * Enables an event utility globally.
     * 
     * @param event The name of the event.
     * @param utility The name of the event utility.
     */
    static enableUtilityGlobally(event: string, utility: string): void {
        const disabledUtilities: string[] | undefined = this.globallyDisabledEventUtils.get(event);

        if (disabledUtilities) {
            disabledUtilities.splice(disabledUtilities.indexOf(utility), 1);

            this.globallyDisabledEventUtils.set(event, disabledUtilities);
        }
    }

    /**
     * Sets a command's cooldown in a channel.
     * 
     * @param channel The channel.
     * @param commandName The name of the command.
     * @param cooldown The cooldown to set, ranging from 5 to 3600 seconds. Use 0 to enable the command and -1 to disable the command.
     * @returns An object containing information about the operation.
     */
    static async setCommandCooldownInChannel(channel: TextChannel | NewsChannel, commandName: string, cooldown: number): Promise<OperationResult> {
        if (cooldown > 0 && !NumberHelper.isNumberInRange(cooldown, 5, 3600, true)) {
            return this.createOperationResult(false, "cooldown must be between 5 and 3600 seconds");
        }

        const channelDisabledCommands: Collection<string, DisabledCommand> = this.channelDisabledCommands.get(channel.id) ?? new Collection();

        if (channelDisabledCommands.size > 0) {
            if (cooldown !== 0) {
                if (channelDisabledCommands.get(commandName)?.cooldown === -1) {
                    return this.createOperationResult(false, "command is already disabled");
                }

                channelDisabledCommands.set(commandName, { name: commandName, cooldown: cooldown });
            } else {
                channelDisabledCommands.delete(commandName);
            }

            this.channelDisabledCommands.set(channel.id, channelDisabledCommands);

            const guildSettings: GuildSettings =
                (await DatabaseManager.aliceDb.collections.guildSettings.getGuildSetting(channel.guildId))!;

            const channelSettings: Collection<Snowflake, GuildChannelSettings> = guildSettings.channelSettings;

            const channelSetting: GuildChannelSettings = channelSettings.get(channel.id) ??
                { id: channel.id, disabledCommands: [], disabledEventUtils: [] };

            channelSetting.disabledCommands = [...channelDisabledCommands.values()];

            channelSettings.set(channel.id, channelSetting);

            return DatabaseManager.aliceDb.collections.guildSettings.update(
                { id: channel.guildId },
                {
                    $set: {
                        channelSettings: [...channelSettings.values()]
                    },
                    $setOnInsert: {
                        disabledEventUtils: [],
                        disabledCommands: []
                    }
                },
                { upsert: true }
            );
        } else {
            this.channelDisabledCommands.set(channel.id, new Collection([[commandName, { name: commandName, cooldown: cooldown }]]));

            const guildSettings: GuildSettings | null =
                await DatabaseManager.aliceDb.collections.guildSettings.getGuildSetting(channel.guildId);

            if (!guildSettings && cooldown === 0) {
                return this.createOperationResult(true);
            }

            const channelSettings: Collection<Snowflake, GuildChannelSettings> = guildSettings?.channelSettings ?? new Collection();

            const channelSetting: GuildChannelSettings = channelSettings.get(channel.id) ??
                { id: channel.id, disabledCommands: [{ name: commandName, cooldown: cooldown }], disabledEventUtils: [] };

            channelSettings.set(channel.id, channelSetting);

            return DatabaseManager.aliceDb.collections.guildSettings.update(
                { id: channel.guildId },
                { 
                    $set: {
                        channelSettings: [...channelSettings.values()]
                    },
                    $setOnInsert: {
                        disabledEventUtils: [],
                        disabledCommands: []
                    }
                },
                { upsert: true }
            );
        }
    }

    /**
     * Sets a command's cooldown in a guild.
     * 
     * @param guildId The ID of the guild.
     * @param commandName The name of the command.
     * @param cooldown The cooldown to set, ranging from 5 to 3600 seconds. Use 0 to enable the command and -1 to disable the command.
     * @returns An object containing information about the operation.
     */
    static async setCommandCooldownInGuild(guildId: Snowflake, commandName: string, cooldown: number): Promise<OperationResult> {
        if (cooldown > 0 && !NumberHelper.isNumberInRange(cooldown, 5, 3600, true)) {
            return this.createOperationResult(false, "cooldown must be between 5 and 3600 seconds");
        }

        const guildCommandSettings: Collection<string, DisabledCommand> = this.guildDisabledCommands.get(guildId) ?? new Collection();

        if (cooldown !== 0) {
            if (guildCommandSettings.get(commandName)?.cooldown === -1) {
                return this.createOperationResult(false, "command is already disabled");
            }

            guildCommandSettings.set(commandName, { name: commandName, cooldown: cooldown });
        } else {
            guildCommandSettings.delete(commandName);
        }

        this.guildDisabledCommands.set(guildId, guildCommandSettings);

        return DatabaseManager.aliceDb.collections.guildSettings.update(
            { id: guildId },
            {
                $set: {
                    disabledCommands: [...guildCommandSettings.values()]
                },
                $setOnInsert: {
                    channelSettings: [],
                    disabledEventUtils: []
                }
            },
            { upsert: true }
        );
    }

    /**
     * Sets a command's cooldown globally.
     * 
     * @param commandName The name of the command.
     * @param cooldown The cooldown to set, ranging from 5 to 3600 seconds. Use 0 to enable the command and -1 to disable the command.
     */
    static setCommandCooldownGlobally(commandName: string, cooldown: number): void {
        if (cooldown !== 0) {
            this.globallyDisabledCommands.set(commandName, cooldown);
        } else {
            this.globallyDisabledCommands.delete(commandName);
        }
    }
}