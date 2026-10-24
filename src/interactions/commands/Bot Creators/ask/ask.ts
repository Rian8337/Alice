import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    heading,
    HeadingLevel,
} from "discord.js";
import { GoogleGenAI } from "@google/genai";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

const ai = new GoogleGenAI({});

export const run: SlashCommand["run"] = async (_, interaction) => {
    const prompt = interaction.options.getString("prompt", true).trim();

    if (!prompt) {
        return InteractionHelper.reply(interaction, {
            content: "Please provide a prompt.",
        });
    }

    await InteractionHelper.deferReply(interaction);

    const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
            systemInstruction:
                // lol system instruction but let's see for now
                "You are a personalized AI assistant contained within a Discord bot. Respond to the user's request in a helpful and informative manner, and with less than 1850 characters.",
        },
    });

    let text = response.text;

    if (text) {
        text += `\n\n-${heading("This is an AI generated response. Please verify its accuracy.", HeadingLevel.One)}`;
    } else {
        text = "The model did not return a response.";
    }

    InteractionHelper.reply(interaction, {
        content: text,
    });
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "ask",
    description: "Asks the AI assistant a question.",
    options: [
        {
            name: "prompt",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The prompt to send to the AI assistant.",
        },
    ],
    example: [
        {
            command: "ask",
            arguments: [
                {
                    name: "prompt",
                    value: "What is the capital of Japan?",
                },
            ],
            description:
                "will ask the AI assistant what the capital of Japan is.",
        },
    ],
    permissions: ["BotOwner"],
    integrationTypes: [ApplicationIntegrationType.UserInstall],
};
