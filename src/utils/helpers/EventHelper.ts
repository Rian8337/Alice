import { Channel, Collection, Guild } from "discord.js";
import { Bot } from "@alice-core/Bot";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { DisabledEventUtil } from '@alice-interfaces/moderation/DisabledEventUtil';
import { Config } from '@alice-core/Config';

/**
 * A helper class for events.
 */
export abstract class EventHelper {
    /**
     * Runs the utilities of an event.
     *
     * @param client The instance of the bot.
     * @param eventDirectory The directory of the event.
     * @param guild The guild at which the event was triggered.
     * @param channel The channel at which the event was triggered.
     * @param utilArgs Arguments for the utility.
     */
    static async runUtilities(client: Bot, eventDirectory: string, guild?: Guild | null, channel?: Channel | null, ...utilArgs: any[]): Promise<void> {
        const eventName: string = <string> eventDirectory.split(/[\/\\]/g).pop();

        for await (const [utilityName, utility] of (client.eventUtilities.get(eventName) ?? new Collection()).entries()) {
            if (Config.isDebug && !utility.config.debugEnabled) {
                continue;
            }

            // Hierarchy: global --> guild --> channel
            if (this.isUtilityDisabledGlobally(eventName, utilityName)) {
                continue;
            }

            if (guild && this.isUtilityDisabledInGuild(guild, eventName, utilityName)) {
                continue;
            }

            if (channel && this.isUtilityDisabledInChannel(channel, eventName, utilityName)) {
                continue;
            }

            if (Config.enableDebugLog) {
                client.logger.info(`Triggered ${utility} event utility from ${eventName} event`);
            }

            await utility.run(client, ...utilArgs);
        }
    }

    /**
     * Checks whether an event utility is disabled in a channel.
     *
     * @param channel The channel.
     * @param eventName The name of the event.
     * @param utilityName The name of the event's utility.
     * @returns Whether the event utility is disabled in the channel.
     */
    static isUtilityDisabledInChannel(channel: Channel, eventName: string, utilityName: string): boolean {
        return this.isUtilityDisabled(
            eventName,
            utilityName,
            CommandUtilManager.channelDisabledEventUtils.get(channel.id)
        );
    }

    /**
     * Checks whether an event utility is disabled in a guild.
     *
     * @param guild The guild.
     * @param eventName The name of the event.
     * @param utilityName The name of the event's utility.
     * @returns Whether the event utility is disabled in the guild.
     */
    static isUtilityDisabledInGuild(guild: Guild, eventName: string, utilityName: string): boolean {
        return this.isUtilityDisabled(
            eventName,
            utilityName,
            CommandUtilManager.guildDisabledEventUtils.get(guild.id)
        );
    }

    /**
     * Checks whether an event utility is disabled globally.
     *
     * @param eventName The name of the event.
     * @param utilityName The name of the event's utility.
     * @returns Whether the event utility is disabled globally.
     */
    static isUtilityDisabledGlobally(eventName: string, utilityName: string): boolean {
        return this.isUtilityDisabled(
            eventName,
            utilityName,
            CommandUtilManager.globallyDisabledEventUtils.map((value, key) => {
                const final: DisabledEventUtil[] = [];

                for (const eventUtil of value) {
                    final.push({ event: key, name: eventUtil });
                }

                return final;
            }).flat()
        );
    }

    /**
     * Checks whether an event utility is contained inside
     * a list of disabled event utilities (whether from
     * a channel, guild, or globally).
     *
     * @param eventName The name of the event.
     * @param utilityName The name of the event's utility.
     * @param disabledEventUtils The event utilities that are disabled in the channel, guild, or global.
     * @returns Whether the event utility is contained inside the list of disabled event utilities.
     */
    private static isUtilityDisabled(eventName: string, utilityName: string, disabledEventUtils?: DisabledEventUtil[]): boolean {
        return !!disabledEventUtils?.find(v => v.event === eventName && v.name === utilityName);
    }
}