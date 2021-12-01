import { CommandInteraction } from "discord.js";
import { EmbedCreator } from "./EmbedCreator";
import { MessageInputCreator } from "./MessageInputCreator";

/**
 * A utility to create repeated input creators without writing too much code.
 */
export class RepeatedInputCreator {
    /**
     * The interaction that triggered this input creator.
     */
    private readonly interaction: CommandInteraction;

    /**
     * The title of the choice embed.
     */
    private readonly choiceTitle: string;

    /**
     * @param interaction The interaction that triggered this input creator.
     * @param choiceTitle The title of the choice embed.
     */
    constructor(interaction: CommandInteraction, choiceTitle: string) {
        this.interaction = interaction;
        this.choiceTitle = choiceTitle;
    }

    /**
     * Creates an input detector and returns the input received from the user.
     *
     * @param choiceDescription The description of the choice embed.
     * @returns The input, `undefined` if no input is given.
     */
    createInput(choiceDescription: string): Promise<string | undefined> {
        return MessageInputCreator.createInputDetector(
            this.interaction,
            {
                embeds: [
                    EmbedCreator.createInputEmbed(
                        this.interaction,
                        this.choiceTitle,
                        choiceDescription
                    ),
                ],
            },
            [],
            [this.interaction.user.id],
            20,
            false
        );
    }
}
