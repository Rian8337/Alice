import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildSettingsCollectionManager } from "@alice-database/managers/aliceDb/GuildSettingsCollectionManager";
import { OperationResult } from "structures/core/OperationResult";
import { DisabledCommand } from "structures/moderation/DisabledCommand";
import { DisabledEventUtil } from "structures/moderation/DisabledEventUtil";
import { Language } from "@alice-localization/base/Language";
import { CommandUtilManagerLocalization } from "@alice-localization/utils/managers/CommandUtilManager/CommandUtilManagerLocalization";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import {
    Collection,
    GuildTextBasedChannel,
    Snowflake,
    ThreadOnlyChannel,
} from "discord.js";
import { CacheManager } from "./CacheManager";

/**
 * A manager for commands and utilities.
 */
export abstract class CommandUtilManager extends Manager {
    /**
     * The commands that are disabled in channels, mapped by channel ID.
     */
    static readonly channelDisabledCommands = new Collection<
        Snowflake,
        Collection<string, DisabledCommand>
    >();

    /**
     * The commands that are disabled in guilds, mapped by guild ID.
     */
    static readonly guildDisabledCommands = new Collection<
        Snowflake,
        Collection<string, DisabledCommand>
    >();

    /**
     * The commands that are globally disabled, mapped by their name.
     */
    static readonly globallyDisabledCommands = new Collection<string, number>();

    /**
     * The global cooldown for all commands.
     */
    static globalCommandCooldown = 0;

    /**
     * The event utilities that are disabled in channels, mapped by channel ID.
     */
    static readonly channelDisabledEventUtils = new Collection<
        Snowflake,
        DisabledEventUtil[]
    >();

    /**
     * The event utilities that are disabled in guilds, mapped by guild ID.
     */
    static readonly guildDisabledEventUtils = new Collection<
        Snowflake,
        DisabledEventUtil[]
    >();

    /**
     * The event utilities that are globally disabled, mapped by their event.
     */
    static readonly globallyDisabledEventUtils = new Collection<
        string,
        string[]
    >();

    private static get guildSettingsDb(): GuildSettingsCollectionManager {
        return DatabaseManager.aliceDb.collections.guildSettings;
    }

    /**
     * Initializes the manager.
     */
    static override async init(): Promise<void> {
        const guildSettings = await this.guildSettingsDb.get(
            "id",
            {},
            {
                projection: {
                    _id: 0,
                    disabledCommands: 1,
                    disabledEventUtils: 1,
                    preferredLocale: 1,
                    "channelSettings.id": 1,
                    "channelSettings.disabledCommands": 1,
                    "channelSettings.disabledEventUtils": 1,
                    "channelSettings.preferredLocale": 1,
                },
            },
        );

        for (const guildSetting of guildSettings.values()) {
            this.guildDisabledCommands.set(
                guildSetting.id,
                guildSetting.disabledCommands,
            );
            this.guildDisabledEventUtils.set(
                guildSetting.id,
                guildSetting.disabledEventUtils,
            );

            CacheManager.guildLocale.set(
                guildSetting.id,
                guildSetting.preferredLocale,
            );

            for (const channelSetting of guildSetting.channelSettings.values()) {
                this.channelDisabledCommands.set(
                    channelSetting.id,
                    ArrayHelper.arrayToCollection(
                        channelSetting.disabledCommands,
                        "name",
                    ),
                );
                this.channelDisabledEventUtils.set(
                    channelSetting.id,
                    channelSetting.disabledEventUtils,
                );

                CacheManager.channelLocale.set(
                    channelSetting.id,
                    channelSetting.preferredLocale ?? "en",
                );
            }
        }

        // Also initialize user locales while we're at it.
        const userLocales =
            await DatabaseManager.aliceDb.collections.userLocale.get(
                "discordId",
            );

        for (const userLocale of userLocales.values()) {
            CacheManager.userLocale.set(
                userLocale.discordId,
                userLocale.locale,
            );
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
    static async disableUtilityInChannel(
        channel: GuildTextBasedChannel | ThreadOnlyChannel,
        event: string,
        utility: string,
    ): Promise<OperationResult> {
        const channelEventUtilSettings = this.channelDisabledEventUtils.get(
            channel.id,
        );

        const disabledEventUtil: DisabledEventUtil = {
            event: event,
            name: utility,
        };

        if (channelEventUtilSettings) {
            if (
                channelEventUtilSettings.find(
                    (v) => v.event === event && v.name === utility,
                )
            ) {
                return this.createOperationResult(true);
            }

            channelEventUtilSettings.push({ name: event, event: utility });

            const guildSettings =
                (await this.guildSettingsDb.getGuildSettingWithChannel(
                    channel.id,
                    {
                        projection: {
                            _id: 0,
                            "channelSettings.$": 1,
                        },
                    },
                ))!;

            const channelSettings = guildSettings.channelSettings;

            channelSettings
                .get(channel.id)!
                .disabledEventUtils.push(disabledEventUtil);

            return this.guildSettingsDb.updateOne(
                { id: channel.guildId },
                {
                    $push: {
                        "channelSettings.$[channelFilter].disabledEventUtils":
                            disabledEventUtil,
                    },
                },
                {
                    arrayFilters: [{ "channelFilter.id": channel.id }],
                },
            );
        } else {
            this.channelDisabledEventUtils.set(channel.id, [
                { name: event, event: utility },
            ]);

            const guildSettings = await this.guildSettingsDb.getGuildSetting(
                channel.guildId,
                {
                    projection: {
                        _id: 0,
                        channelSettings: 1,
                    },
                },
            );

            if (!guildSettings) {
                return this.guildSettingsDb.insert({
                    id: channel.guildId,
                    channelSettings: [
                        {
                            id: channel.id,
                            disabledCommands: [],
                            disabledEventUtils: [disabledEventUtil],
                        },
                    ],
                });
            }

            const channelSettings = guildSettings.channelSettings;

            const channelSetting = channelSettings.get(channel.id) ?? {
                id: channel.id,
                disabledCommands: [],
                disabledEventUtils: [],
            };

            channelSetting.disabledEventUtils.push(disabledEventUtil);

            channelSettings.set(channel.id, channelSetting);

            return this.guildSettingsDb.updateOne(
                { id: channel.guildId },
                {
                    $push: {
                        "channelSettings.$[channelFilter].disabledEventUtils":
                            disabledEventUtil,
                    },
                },
                {
                    arrayFilters: [{ "channelFilter.id": channel.id }],
                },
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
    static async disableUtilityInGuild(
        guildId: Snowflake,
        event: string,
        utility: string,
    ): Promise<OperationResult> {
        const guildEventUtilSettings =
            this.guildDisabledEventUtils.get(guildId) ?? [];

        if (
            guildEventUtilSettings.find(
                (v) => v.event === event && v.name === utility,
            )
        ) {
            return this.createOperationResult(true);
        }

        const disabledEventUtil: DisabledEventUtil = {
            event: event,
            name: utility,
        };

        guildEventUtilSettings.push(disabledEventUtil);

        this.guildDisabledEventUtils.set(guildId, guildEventUtilSettings);

        return this.guildSettingsDb.updateOne(
            { id: guildId },
            {
                $push: {
                    disabledEventUtils: disabledEventUtil,
                },
                $setOnInsert: {
                    channelSettings: [],
                    disabledCommands: [],
                },
            },
            { upsert: true },
        );
    }

    /**
     * Disables an event utility globally.
     *
     * @param event The name of the event.
     * @param utility The name of the event utility.
     */
    static disableUtilityGlobally(event: string, utility: string): void {
        const disabledUtilities =
            this.globallyDisabledEventUtils.get(event) ?? [];

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
    static async enableUtilityInChannel(
        channel: GuildTextBasedChannel | ThreadOnlyChannel,
        event: string,
        utility: string,
    ): Promise<OperationResult> {
        const channelEventUtilSettings = this.channelDisabledEventUtils.get(
            channel.id,
        );

        if (!channelEventUtilSettings) {
            return this.createOperationResult(true);
        }

        const settingIndex = channelEventUtilSettings.findIndex(
            (v) => v.event === event && v.name === utility,
        );

        if (settingIndex === -1) {
            return this.createOperationResult(true);
        }

        channelEventUtilSettings.splice(settingIndex, 1);

        const guildSettings =
            (await this.guildSettingsDb.getGuildSettingWithChannel(channel.id, {
                projection: {
                    _id: 0,
                    "channelSettings.$": 1,
                },
            }))!;

        const { channelSettings } = guildSettings;

        const disabledEventUtil: DisabledEventUtil = {
            event: event,
            name: utility,
        };

        channelSettings
            .get(channel.id)!
            .disabledEventUtils.push(disabledEventUtil);

        return this.guildSettingsDb.updateOne(
            { id: channel.guildId },
            {
                $pull: {
                    "channelSettings.$[channelFilter].disabledEventUtils":
                        disabledEventUtil,
                },
            },
            {
                arrayFilters: [{ "channelFilter.id": channel.id }],
            },
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
    static async enableUtilityInGuild(
        guildId: Snowflake,
        event: string,
        utility: string,
    ): Promise<OperationResult> {
        const guildEventUtilSettings =
            this.guildDisabledEventUtils.get(guildId);

        if (!guildEventUtilSettings) {
            return this.createOperationResult(true);
        }

        const settingIndex = guildEventUtilSettings.findIndex(
            (v) => v.event === event && v.name === utility,
        );

        if (settingIndex === -1) {
            return this.createOperationResult(true);
        }

        guildEventUtilSettings.splice(settingIndex, 1);

        this.guildDisabledEventUtils.set(guildId, guildEventUtilSettings);

        return this.guildSettingsDb.updateOne(
            { id: guildId },
            {
                $pull: {
                    disabledEventUtils: {
                        event: event,
                        name: utility,
                    },
                },
            },
        );
    }

    /**
     * Enables an event utility globally.
     *
     * @param event The name of the event.
     * @param utility The name of the event utility.
     */
    static enableUtilityGlobally(event: string, utility: string): void {
        const disabledUtilities = this.globallyDisabledEventUtils.get(event);

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
     * @param language The language to localize. Defaults to English.
     * @returns An object containing information about the operation.
     */
    static async setCommandCooldownInChannel(
        channel: GuildTextBasedChannel | ThreadOnlyChannel,
        commandName: string,
        cooldown: number,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (
            cooldown > 0 &&
            !NumberHelper.isNumberInRange(cooldown, 5, 3600, true)
        ) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cooldownOutOfRange"),
            );
        }

        const channelDisabledCommands =
            this.channelDisabledCommands.get(channel.id) ?? new Collection();

        if (channelDisabledCommands.has(commandName)) {
            const disabledCommand = channelDisabledCommands.get(commandName)!;

            if (disabledCommand.cooldown === cooldown) {
                return this.createOperationResult(true);
            }

            if (cooldown !== 0) {
                channelDisabledCommands.set(commandName, disabledCommand);
            } else {
                channelDisabledCommands.delete(commandName);
            }

            this.channelDisabledCommands.set(
                channel.id,
                channelDisabledCommands,
            );

            const guildSettings = (await this.guildSettingsDb.getGuildSetting(
                channel.guildId,
            ))!;

            const { channelSettings } = guildSettings;

            if (!channelSettings.has(channel.id)) {
                return this.guildSettingsDb.updateOne(
                    { id: channel.guildId },
                    {
                        $push: {
                            channelSettings: {
                                id: channel.id,
                                disabledCommands: [disabledCommand],
                                disabledEventUtils: [],
                            },
                        },
                    },
                );
            }

            return this.guildSettingsDb.updateOne(
                { id: channel.guildId },
                {
                    $push: {
                        "channelSettings.$[channelFilter].disabledCommands":
                            disabledCommand,
                    },
                },
                {
                    arrayFilters: [{ "channelFilter.id": channel.id }],
                },
            );
        } else {
            if (cooldown === 0) {
                return this.createOperationResult(true);
            }

            const disabledCommand: DisabledCommand = {
                name: commandName,
                cooldown: cooldown,
            };

            this.channelDisabledCommands.set(
                channel.id,
                new Collection([[commandName, disabledCommand]]),
            );

            const guildSettings = await this.guildSettingsDb.getGuildSetting(
                channel.guildId,
            );

            if (!guildSettings) {
                return this.guildSettingsDb.insert({
                    id: channel.guildId,
                    channelSettings: [
                        {
                            id: channel.id,
                            disabledCommands: [disabledCommand],
                            disabledEventUtils: [],
                        },
                    ],
                });
            }

            if (!guildSettings.channelSettings.has(channel.id)) {
                return this.guildSettingsDb.updateOne(
                    { id: channel.guildId },
                    {
                        $push: {
                            channelSettings: {
                                id: channel.id,
                                disabledCommands: [disabledCommand],
                                disabledEventUtils: [],
                            },
                        },
                    },
                );
            }

            return this.guildSettingsDb.updateOne(
                { id: channel.guildId },
                {
                    $push: {
                        "channelSettings.$[channelFilter].disabledCommand":
                            disabledCommand,
                    },
                },
                {
                    arrayFilters: [{ "channelFilter.id": channel.id }],
                },
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
    static async setCommandCooldownInGuild(
        guildId: Snowflake,
        commandName: string,
        cooldown: number,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (
            cooldown > 0 &&
            !NumberHelper.isNumberInRange(cooldown, 5, 3600, true)
        ) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cooldownOutOfRange"),
            );
        }

        const guildDisabledCommands =
            this.guildDisabledCommands.get(guildId) ?? new Collection();

        const guildDisabledCommand = guildDisabledCommands.get(commandName) ?? {
            name: commandName,
            cooldown: cooldown,
        };

        this.guildDisabledCommands.set(guildId, guildDisabledCommands);

        if (!guildDisabledCommands.has(commandName)) {
            if (cooldown === 0) {
                return this.createOperationResult(true);
            }

            guildDisabledCommands.set(commandName, guildDisabledCommand);

            return this.guildSettingsDb.updateOne(
                { id: guildId },
                {
                    $push: {
                        disabledCommands: guildDisabledCommand,
                    },
                },
            );
        }

        if (guildDisabledCommand.cooldown === cooldown) {
            return this.createOperationResult(true);
        }

        return this.guildSettingsDb.updateOne(
            { id: guildId },
            {
                $set: {
                    "disabledCommands.$[commandFilter].cooldown": cooldown,
                },
            },
            {
                arrayFilters: [{ "commandFilter.name": commandName }],
            },
        );
    }

    /**
     * Sets a command's cooldown globally.
     *
     * @param commandName The name of the command.
     * @param cooldown The cooldown to set, ranging from 5 to 3600 seconds. Use 0 to enable the command and -1 to disable the command.
     */
    static setCommandCooldownGlobally(
        commandName: string,
        cooldown: number,
    ): void {
        if (cooldown !== 0) {
            this.globallyDisabledCommands.set(commandName, cooldown);
        } else {
            this.globallyDisabledCommands.delete(commandName);
        }
    }

    /**
     * Gets the localization of this manager utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language,
    ): CommandUtilManagerLocalization {
        return new CommandUtilManagerLocalization(language);
    }
}
