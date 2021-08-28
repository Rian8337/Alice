import { Collection, CommandInteraction, DMChannel, GuildMember, MessageSelectOptionData, PermissionResolvable, TextChannel } from 'discord.js';
import { Subcommand } from '@alice-interfaces/core/Subcommand';
import { CacheManager } from '../managers/CacheManager';
import { CommandScope } from '@alice-types/core/CommandScope';
import { DisabledCommand } from '@alice-interfaces/moderation/DisabledCommand';
import { Constants } from '@alice-core/Constants';
import { CooldownKey } from '@alice-types/core/CooldownKey';
import { Permission } from '@alice-types/core/Permission';
import { Config } from '@alice-core/Config';
import { SelectMenuCreator } from '@alice-utils/creators/SelectMenuCreator';
import { MessageCreator } from '@alice-utils/creators/MessageCreator';
import { PermissionHelper } from './PermissionHelper';
import { CommandUtilManager } from '@alice-utils/managers/CommandUtilManager';
import { DateTimeFormatHelper } from './DateTimeFormatHelper';
import { Manager } from '@alice-utils/base/Manager';

/**
 * Helpers for commands.
 */
export abstract class CommandHelper extends Manager {
    /**
     * Runs a subcommand that isn't directly picked by the user via an interaction.
     * 
     * The user will be prompted to choose which subcommand to run using a select menu.
     * 
     * @param interaction The interaction that triggered the subcommand.
     * @param mainCommandDirectory The directory of the subcommand.
     * @param subcommandChoices The subcommands of the command. The user will be prompted to choose one of these subcommands in order.
     * @param placeholder The placeholder text for the subcommand's select menu.
     */
    static async runSubcommandNotFromInteraction(interaction: CommandInteraction, mainCommandDirectory: string, subcommandChoices: MessageSelectOptionData[], placeholder: string): Promise<any> {
        const pickedSubcommand: string | undefined = await SelectMenuCreator.createSelectMenu(
            interaction,
            placeholder,
            subcommandChoices,
            [interaction.user.id],
            20
        );

        if (!pickedSubcommand) {
            return;
        }

        return this.runSubOrGroup(interaction, await import(`${mainCommandDirectory}/subcommands/${pickedSubcommand}`));
    }

    /**
     * Runs a subcommand that is directly picked by the user via an interaction.
     * 
     * @param interaction The interaction that triggered the subcommand.
     */
    static runSubcommandFromInteraction(interaction: CommandInteraction): Promise<any> {
        return this.runSubOrGroup(interaction, this.getSubcommand(interaction));
    }

    /**
     * Runs a subcommand group picked by the user via an interaction.
     * 
     * This should only be used inside a command.
     * 
     * @param interaction The interaction that triggered the command.
     */
    static runSubcommandGroup(interaction: CommandInteraction): Promise<any> {
        return this.runSubOrGroup(interaction, this.getSubcommandGroup(interaction));
    }

    /**
     * Runs a subcommand group or subcommand.
     * 
     * @param interaction The interaction that triggered the subcommand group or subcommand.
     * @param subcommand The subcommand to run.
     */
    private static runSubOrGroup(interaction: CommandInteraction, subcommand?: Subcommand): Promise<any> {
        if (!subcommand) {
            return interaction.editReply({
                content: MessageCreator.createReject("I'm sorry, I cannot find the command that you are looking for!")
            });
        }

        if (!this.userFulfillsCommandPermission(interaction, subcommand.config.permissions)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    `${Constants.noPermissionReject}. You need these permissions: \`${PermissionHelper.getPermissionString(subcommand.config.permissions)}\`.`
                )
            });
        }

        return subcommand.run(this.client, interaction);
    }

    /**
     * Gets the subcommand that is run by the user via an interaction.
     * 
     * @param interaction The interaction that triggered the subcommand.
     * @returns The subcommand, if found.
     */
    static getSubcommand(interaction: CommandInteraction): Subcommand | undefined {
        if (!interaction.options.getSubcommand(false)) {
            return undefined;
        }

        const subcommandGroupName: string = [
            interaction.commandName,
            interaction.options.getSubcommandGroup(false) ?? ""
        ].filter(Boolean).join("-");

        const subcommandFileName: string = [
            subcommandGroupName,
            interaction.options.getSubcommand()
        ].join("-");

        return this.client.subcommands.get(subcommandGroupName)?.get(subcommandFileName) ||
            this.client.subcommands.get(interaction.commandName)?.get(subcommandFileName);
    }

    /**
     * Gets the subcommand group that is run by the user via an interaction.
     * 
     * @param interaction The interaction that triggered the subcommand group.
     * @returns The subcommand group, if found.
     */
    static getSubcommandGroup(interaction: CommandInteraction): Subcommand | undefined {
        if (!interaction.options.getSubcommandGroup(false)) {
            return undefined;
        }

        const subcommandGroupName: string = [
            interaction.commandName,
            interaction.options.getSubcommandGroup()
        ].join("-");

        return this.client.subcommandGroups.get(interaction.commandName)?.get(subcommandGroupName);
    }

    /**
     * Checks if an interaction fulfills a command's permissions.
     * 
     * @param message The interaction that executed the command.
     * @param permissions The command's permissions.
     * @returns Whether the interaction can run the command.
     */
    static userFulfillsCommandPermission(interaction: CommandInteraction, permissions: Permission[]): boolean {
        // Allow bot owner to override all permission requirement
        if (permissions.some(v => v === "BOT_OWNER")) {
            return this.isExecutedByBotOwner(interaction);
        }

        if (permissions.some(v => v === "SPECIAL")) {
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
    static checkPermission(interaction: CommandInteraction, ...permissions: PermissionResolvable[]): boolean {
        if (permissions.length === 0) {
            return true;
        }

        const member: GuildMember | null = <GuildMember | null> interaction.member;

        if (!member || interaction.channel instanceof DMChannel) {
            return false;
        }

        return (<TextChannel | null> interaction.channel)?.permissionsFor(member).has(permissions) || member.permissions.has(permissions);
    }

    /**
     * Checks if a command is executable based on its scope.
     * 
     * @param interaction The interaction that triggered the command.
     * @param scope The command's scope.
     * @returns Whether the command can be executed in the scope.
     */
    static isCommandExecutableInScope(interaction: CommandInteraction, scope: CommandScope): boolean {
        switch (scope) {
            case "DM":
                return interaction.channel instanceof DMChannel;
            case "GUILD_CHANNEL":
                return !(interaction.channel instanceof DMChannel);
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
        if (CommandUtilManager.globallyDisabledCommands.get(interaction.commandName) === -1) {
            return false;
        }

        if (interaction.inGuild()) {
            const guildSetting: Collection<string, DisabledCommand> | undefined = CommandUtilManager.guildDisabledCommands.get(interaction.guildId);

            if (guildSetting?.get(interaction.commandName)?.cooldown === -1) {
                return false;
            }
        }

        return CommandUtilManager.channelDisabledCommands.get(interaction.channel!.id)?.get(interaction.commandName)?.cooldown !== -1;
    }

    /**
     * Activates a command's cooldown upon a user.
     * 
     * @param key The cooldown key, which is `{User ID}:{command name}`
     * @param cooldown The cooldown of the command, in seconds.
     */
    static setCooldown(key: CooldownKey, cooldown: number): void {
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
    static isCooldownActive(key: CooldownKey): boolean {
        return CacheManager.activeCommandCooldowns.has(key);
    }

    /**
     * Checks if a command triggered by an interaction is executed by a bot owner.
     * 
     * @param interaction The interaction.
     * @returns Whether the command is executed by a bot owner.
     */
    static isExecutedByBotOwner(interaction: CommandInteraction): boolean {
        return Config.botOwners.includes(interaction.user.id);
    }

    /**
     * Converts a time format duration input to seconds.
     * 
     * @param input The input.
     * @returns The amount of seconds represented by the input.
     */
    static convertStringTimeFormat(input: string): number {
        return parseFloat(input) || DateTimeFormatHelper.DHMStoSeconds(input);
    }
}