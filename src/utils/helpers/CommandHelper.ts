import {
    BaseGuildTextChannel,
    BaseInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    Collection,
    CommandInteraction,
    GuildMember,
    PermissionResolvable,
    SelectMenuComponentOptionData,
    SelectMenuInteraction,
    Snowflake,
    ThreadChannel,
    User,
} from "discord.js";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { CacheManager } from "../managers/CacheManager";
import { CommandScope } from "structures/core/CommandScope";
import { DisabledCommand } from "structures/moderation/DisabledCommand";
import { Constants } from "@alice-core/Constants";
import {
    ChannelCooldownKey,
    GlobalCooldownKey,
} from "structures/core/CooldownKey";
import { Permission } from "structures/core/Permission";
import { Config } from "@alice-core/Config";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "./PermissionHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { DateTimeFormatHelper } from "./DateTimeFormatHelper";
import { Manager } from "@alice-utils/base/Manager";
import { ApplicationCommandOptionType } from "discord.js";
import { Language } from "@alice-localization/base/Language";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildSettings } from "@alice-database/utils/aliceDb/GuildSettings";
import { UserLocale } from "@alice-database/utils/aliceDb/UserLocale";
import { CommandHelperLocalization } from "@alice-localization/utils/helpers/CommandHelper/CommandHelperLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "./InteractionHelper";

/**
 * Helpers for commands.
 */
export abstract class CommandHelper extends Manager {
    /**
     * Runs a slash subcommand that isn't directly picked by the user via an interaction.
     *
     * The user will be prompted to choose which subcommand to run using a select menu.
     *
     * @param interaction The interaction that triggered the subcommand.
     * @param mainCommandDirectory The directory of the subcommand.
     * @param subcommandChoices The subcommands of the command. The user will be prompted to choose one of these subcommands in order.
     * @param placeholder The placeholder text for the subcommand's select menu.
     */
    static async runSlashSubcommandNotFromInteraction(
        interaction: ChatInputCommandInteraction,
        mainCommandDirectory: string,
        subcommandChoices: SelectMenuComponentOptionData[],
        placeholder: string
    ): Promise<unknown> {
        const selectMenuInteraction: SelectMenuInteraction | null =
            await SelectMenuCreator.createSelectMenu(
                interaction,
                {
                    content: MessageCreator.createWarn(placeholder),
                },
                subcommandChoices,
                [interaction.user.id],
                20
            );

        if (!selectMenuInteraction) {
            return;
        }

        const pickedSubcommand: string = selectMenuInteraction.values[0];

        return this.runSlashSubOrGroup(
            selectMenuInteraction,
            await import(
                `${mainCommandDirectory}/subcommands/${pickedSubcommand}`
            ),
            await this.getLocale(interaction)
        );
    }

    /**
     * Gets the preferred locale of an interaction.
     *
     * @param interaction The interaction.
     * @returns The preferred locale of the channel or server, either set locally to bot or from the interaction.
     */
    static async getLocale(interaction: BaseInteraction): Promise<Language>;

    /**
     * Gets the preferred locale of a channel.
     *
     * @param channel The channel.
     * @returns The preferred locale of the channel or server, English if the channel doesn't have a preferred locale.
     */
    static async getLocale(channel: BaseGuildTextChannel): Promise<Language>;

    /**
     * Gets the preferred locale of a user.
     *
     * Keep in mind that this is only for command usage (e.g. in DM). To directly retrieve a user's locale information, use `<UserLocaleCollectionManager>.getUserLocale()`.
     *
     * @param user The user.
     * @returns The preferred locale of the user, English if the user doesn't have a preferred locale.
     */
    static async getLocale(user: User): Promise<Language>;

    /**
     * Gets the preferred locale of a channel.
     *
     * @param channelId The ID of the channel.
     * @returns The preferred locale of the channel or server, English if the channel doesn't have a preferred locale.
     */
    static async getLocale(channelId: Snowflake): Promise<Language>;

    static async getLocale(
        input: BaseInteraction | BaseGuildTextChannel | Snowflake | User
    ): Promise<Language> {
        let language: Language | undefined;

        if (
            (input instanceof BaseInteraction &&
                input.channel?.type === ChannelType.DM) ||
            input instanceof User
        ) {
            if (input instanceof BaseInteraction) {
                switch (input.locale) {
                    case "ko":
                        language = "kr";
                        break;
                    case "es-ES":
                        language = "es";
                        break;
                }
            }

            return (
                language ??
                this.getUserPreferredLocale(
                    input instanceof BaseInteraction ? input.user.id : input.id
                )
            );
        }

        let channelId: Snowflake;

        if (input instanceof BaseInteraction) {
            channelId =
                input.channel instanceof ThreadChannel
                    ? input.channel.parentId!
                    : input.channelId!;
        } else if (input instanceof ThreadChannel) {
            channelId = input.parentId!;
        } else if (input instanceof BaseGuildTextChannel) {
            channelId = input.id;
        } else {
            channelId = input;
        }

        language = CacheManager.channelLocale.get(channelId);

        if (!language) {
            const guildSetting: GuildSettings | null =
                await DatabaseManager.aliceDb.collections.guildSettings.getGuildSettingWithChannel(
                    channelId,
                    {
                        projection: {
                            _id: 0,
                            "channelSettings.$": 1,
                        },
                    }
                );

            language =
                guildSetting?.channelSettings.get(channelId)?.preferredLocale ??
                guildSetting?.preferredLocale ??
                "en";

            CacheManager.channelLocale.set(channelId, language);
        }

        return language;
    }

    /**
     * Gets the preferred locale of a user.
     *
     * @param interaction The interaction between the user.
     * @returns The user's preferred locale, English if the user doesn't have a preferred locale.
     */
    static async getUserPreferredLocale(
        interaction: BaseInteraction
    ): Promise<Language>;

    /**
     * Gets the preferred locale of a user.
     *
     * @param user The user.
     * @returns The user's preferred locale, English if the user doesn't have a preferred locale.
     */
    static async getUserPreferredLocale(user: User): Promise<Language>;

    /**
     * Gets the preferred locale of a user.
     *
     * @param userId The ID of the user.
     * @returns The user's preferred locale, English if the user doesn't have a preferred locale.
     */
    static async getUserPreferredLocale(userId: Snowflake): Promise<Language>;

    static async getUserPreferredLocale(
        input: BaseInteraction | Snowflake | User
    ): Promise<Language> {
        const id: Snowflake =
            input instanceof BaseInteraction
                ? input.user.id
                : input instanceof User
                ? input.id
                : input;

        let language: Language | undefined = CacheManager.userLocale.get(id);

        if (!language) {
            const userLocale: UserLocale | null =
                await DatabaseManager.aliceDb.collections.userLocale.getUserLocale(
                    id
                );

            language = userLocale?.locale ?? "en";

            CacheManager.userLocale.set(id, language);
        }

        return language;
    }

    /**
     * Runs a slash subcommand or subcommand group that is directly picked
     * by the user via an interaction.
     *
     * Use this if a command has both subcommands and subcommand groups.
     *
     * @param interaction The interaction that triggered the subcommand or subcommand group.
     * @param language The locale of the user who attempted to run the subcommand or subcommand group. Defaults to English.
     */
    static runSlashSubcommandOrGroup(
        interaction: ChatInputCommandInteraction,
        language: Language = "en"
    ): Promise<unknown> {
        if (interaction.options.getSubcommandGroup(false)) {
            return this.runSlashSubcommandGroup(interaction, language);
        } else {
            return this.runSlashSubcommandFromInteraction(
                interaction,
                language
            );
        }
    }

    /**
     * Runs a slash subcommand that is directly picked by the user via an interaction.
     *
     * @param interaction The interaction that triggered the subcommand.
     * @param language The locale of the user who attempted to run the subcommand. Defaults to English.
     */
    static runSlashSubcommandFromInteraction(
        interaction: ChatInputCommandInteraction,
        language: Language = "en"
    ): Promise<unknown> {
        return this.runSlashSubOrGroup(
            interaction,
            this.getSlashSubcommand(interaction),
            language
        );
    }

    /**
     * Runs a slash subcommand group picked by the user via an interaction.
     *
     * This should only be used inside a command.
     *
     * @param interaction The interaction that triggered the command.
     */
    static runSlashSubcommandGroup(
        interaction: ChatInputCommandInteraction,
        language: Language = "en"
    ): Promise<unknown> {
        return this.runSlashSubOrGroup(
            interaction,
            this.getSlashSubcommandGroup(interaction),
            language
        );
    }

    /**
     * Runs a slash subcommand group or subcommand.
     *
     * @param interaction The interaction that triggered the subcommand group or subcommand.
     * @param subcommand The subcommand to run.
     */
    private static runSlashSubOrGroup(
        interaction: ChatInputCommandInteraction | SelectMenuInteraction,
        subcommand?: SlashSubcommand,
        language: Language = "en"
    ): Promise<unknown> {
        const localization: CommandHelperLocalization =
            this.getLocalization(language);

        if (!subcommand) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("commandNotFound")
                ),
            });
        }

        if (
            !this.userFulfillsCommandPermission(
                interaction,
                subcommand.config.permissions
            )
        ) {
            interaction.ephemeral = true;

            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    `${new ConstantsLocalization(language).getTranslation(
                        Constants.noPermissionReject
                    )} ${localization.getTranslation(
                        "permissionsRequired"
                    )}: \`${PermissionHelper.getPermissionString(
                        subcommand.config.permissions
                    )}\`.`
                ),
            });
        }

        return subcommand.run(this.client, interaction);
    }

    /**
     * Gets the slash subcommand that is run by the user via an interaction.
     *
     * @param interaction The interaction that triggered the subcommand.
     * @returns The subcommand, if found.
     */
    static getSlashSubcommand(
        interaction: ChatInputCommandInteraction
    ): SlashSubcommand | undefined {
        if (!interaction.options.getSubcommand(false)) {
            return;
        }

        const subcommandFileName: string = [
            interaction.commandName,
            interaction.options.getSubcommandGroup(false) ?? "",
            interaction.options.getSubcommand(),
        ]
            .filter(Boolean)
            .join("-");

        return this.client.interactions.chatInput
            .get(interaction.commandName)
            ?.subcommands.get(subcommandFileName);
    }

    /**
     * Gets the slash subcommand group that is run by the user via an interaction.
     *
     * @param interaction The interaction that triggered the subcommand group.
     * @returns The subcommand group, if found.
     */
    static getSlashSubcommandGroup(
        interaction: ChatInputCommandInteraction
    ): SlashSubcommand | undefined {
        if (!interaction.options.getSubcommandGroup(false)) {
            return;
        }

        const subcommandGroupName: string = [
            interaction.commandName,
            interaction.options.getSubcommandGroup(),
        ].join("-");

        return this.client.interactions.chatInput
            .get(interaction.commandName)
            ?.subcommandGroups.get(subcommandGroupName);
    }

    /**
     * Checks if an interaction fulfills a command's permissions.
     *
     * @param message The interaction that executed the command.
     * @param permissions The command's permissions.
     * @returns Whether the interaction can run the command.
     */
    static userFulfillsCommandPermission(
        interaction: BaseInteraction,
        permissions: Permission[]
    ): boolean {
        // Allow bot owner to override all permission requirement
        if (permissions.some((v) => v === "BotOwner")) {
            return this.isExecutedByBotOwner(interaction);
        }

        if (permissions.some((v) => v === "Special")) {
            return true;
        }

        //@ts-expect-error: permissions array should only consist of `PermissionString`
        // now, so it's safe to throw into the function
        return this.checkPermission(interaction, ...permissions);
    }

    /**
     * Checks whether an interaction has all the specified permissions.
     *
     * Both channel-specific and guild-wide permissions will be considered.
     *
     * @param interaction The interaction.
     * @param permissions The permissions to check for.
     * @returns Whether the guild member has all the specified permissions.
     */
    static checkPermission(
        interaction: BaseInteraction,
        ...permissions: PermissionResolvable[]
    ): boolean {
        if (permissions.length === 0) {
            return true;
        }

        const member: GuildMember | null = <GuildMember | null>(
            interaction.member
        );

        if (!member || interaction.channel?.type === ChannelType.DM) {
            return false;
        }

        return interaction.memberPermissions?.has(permissions) ?? false;
    }

    /**
     * Checks if a command is executable based on its scope.
     *
     * @param interaction The interaction that triggered the command.
     * @param scope The command's scope.
     * @returns Whether the command can be executed in the scope.
     */
    static isCommandExecutableInScope(
        interaction: BaseInteraction,
        scope: CommandScope
    ): boolean {
        switch (scope) {
            case "DM":
                return interaction.channel?.type === ChannelType.DM;
            case "GUILD_CHANNEL":
                return interaction.channel?.type !== ChannelType.DM;
            default:
                return true;
        }
    }

    /**
     * Checks if a command triggered by an interaction is enabled globally, in the guild, or in the channel.
     *
     * @param interaction The interaction.
     * @returns Whether the command is enabled.
     */
    static isCommandEnabled(interaction: CommandInteraction): boolean {
        // Hierarchy: global --> guild --> channel
        if (
            CommandUtilManager.globallyDisabledCommands.get(
                interaction.commandName
            ) === -1
        ) {
            return false;
        }

        if (interaction.inGuild()) {
            const guildSetting:
                | Collection<string, DisabledCommand>
                | undefined = CommandUtilManager.guildDisabledCommands.get(
                interaction.guildId
            );

            if (guildSetting?.get(interaction.commandName)?.cooldown === -1) {
                return false;
            }
        }

        return (
            CommandUtilManager.channelDisabledCommands
                .get(interaction.channelId)
                ?.get(interaction.commandName)?.cooldown !== -1
        );
    }

    /**
     * Converts a command option type to its string representation.
     *
     * @param type The command option type to convert.
     * @returns The command option type's string representation.
     */
    static optionTypeToString(type: ApplicationCommandOptionType): string {
        switch (type) {
            case ApplicationCommandOptionType.Boolean:
                return "Boolean";
            case ApplicationCommandOptionType.Channel:
                return "Channel";
            case ApplicationCommandOptionType.Integer:
                return "Integer";
            case ApplicationCommandOptionType.Mentionable:
                return "Mentionable";
            case ApplicationCommandOptionType.Number:
                return "Number";
            case ApplicationCommandOptionType.Role:
                return "Role";
            case ApplicationCommandOptionType.String:
                return "String";
            case ApplicationCommandOptionType.Subcommand:
                return "Subcommand";
            case ApplicationCommandOptionType.SubcommandGroup:
                return "Subcommand Group";
            case ApplicationCommandOptionType.User:
                return "User";
            case ApplicationCommandOptionType.Attachment:
                return "Attachment";
        }
    }

    /**
     * Activates a command's cooldown upon a user.
     *
     * @param key The key of the cooldown.
     * @param cooldown The cooldown to apply, in seconds.
     */
    static setCooldown(
        key: ChannelCooldownKey | GlobalCooldownKey,
        cooldown: number
    ): void {
        if (cooldown === 0) {
            return;
        }

        CacheManager.activeCommandCooldowns.add(key);

        setTimeout(() => {
            CacheManager.activeCommandCooldowns.delete(key);
        }, cooldown * 1000);
    }

    /**
     * Checks whether a cooldown still exists.
     *
     * @param key The key of the cooldown.
     * @returns Whether the cooldown with the specified key still exists.
     */
    static isCooldownActive(
        key: ChannelCooldownKey | GlobalCooldownKey
    ): boolean {
        return CacheManager.activeCommandCooldowns.has(key);
    }

    /**
     * Checks if a command triggered by an interaction is executed by a bot owner.
     *
     * @param interaction The interaction.
     * @returns Whether the command is executed by a bot owner.
     */
    static isExecutedByBotOwner(interaction: BaseInteraction): boolean {
        return Config.botOwners.includes(interaction.user.id);
    }

    /**
     * Converts a time format duration input to seconds.
     *
     * @param input The input.
     * @returns The amount of seconds represented by the input.
     */
    static convertStringTimeFormat(input: string): number {
        return DateTimeFormatHelper.DHMStoSeconds(input) || parseFloat(input);
    }

    /**
     * Gets the localization of this helper utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): CommandHelperLocalization {
        return new CommandHelperLocalization(language);
    }
}
