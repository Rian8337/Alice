import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    BaseCommandInteraction,
    InteractionReplyOptions,
    Message,
    MessageCollector,
    MessageComponentInteraction,
    Snowflake,
} from "discord.js";
import { MessageCreator } from "./MessageCreator";

/**
 * A utility to create input detectors in channels.
 */
export abstract class MessageInputCreator {
    /**
     * Creates an input detector.
     *
     * @param interaction The interaction that triggered the input detector.
     * @param options Options for the message notifying that an input detector is active.
     * @param choices Messages that are accepted by the detector. Use an empty array to accept any kind of message.
     * @param users The IDs of users who can give an input.
     * @param duration The duration the input detector will remain active, in seconds.
     * @param deleteOnInput Whether to delete the input after given. Defaults to `true`.
     * @returns The picked choice or given input, `undefined` if the users didn't pick any choice or give any input.
     */
    static async createInputDetector(
        interaction: BaseCommandInteraction | MessageComponentInteraction,
        options: InteractionReplyOptions,
        choices: string[],
        users: Snowflake[],
        duration: number,
        deleteOnInput: boolean = true
    ): Promise<string | undefined> {
        const message: Message = await InteractionHelper.reply(
            interaction,
            options
        );

        const collector: MessageCollector =
            message.channel.createMessageCollector({
                filter: (m: Message) =>
                    ((choices.length > 0
                        ? choices.includes(m.content)
                        : m.content.replace(/\s/g, "").length > 0) ||
                        m.content.toLowerCase() === "exit") &&
                    users.includes(m.author.id),
                time: duration * 1000,
            });

        collector.once("collect", async (m: Message) => {
            if (deleteOnInput && m.deletable) {
                await m.delete();
            }

            collector.stop();
        });

        return new Promise((resolve) => {
            collector.once("end", async (collected) => {
                if (collected.size === 0) {
                    interaction instanceof MessageComponentInteraction
                        ? await InteractionHelper.update(interaction, {
                              content:
                                  MessageCreator.createReject("Timed out."),
                          })
                        : await InteractionHelper.reply(interaction, {
                              content:
                                  MessageCreator.createReject("Timed out."),
                          });

                    if (!interaction.ephemeral) {
                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5 * 1000);
                    }
                }

                if (collected.first()?.content === "exit") {
                    return resolve(undefined);
                }

                resolve(collected.first()?.content);
            });
        });
    }
}
