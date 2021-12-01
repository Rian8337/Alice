import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ApplicationCommandData } from "discord.js";
import { deployStrings } from "./deployStrings";

export const run: Command["run"] = async (client, interaction) => {
    const commandName: string = interaction.options.getString("command", true);

    const command: Command | undefined = client.commands.get(commandName);

    if (!command) {
        return interaction.editReply({
            content: MessageCreator.createReject(deployStrings.commandNotFound),
        });
    }

    const data: ApplicationCommandData = {
        name: command.config.name,
        description: command.config.description,
        options: command.config.options,
    };

    if (interaction.options.getBoolean("debug")) {
        await interaction.guild!.commands.create(data);
    } else {
        await client.application!.commands.create(data);
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            deployStrings.commandDeploySuccessful,
            commandName
        ),
    });
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "deploy",
    description: "Deploys a command to Discord.",
    options: [
        {
            name: "command",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description: "The command name.",
        },
        {
            name: "debug",
            type: ApplicationCommandOptionTypes.BOOLEAN,
            description: "Whether to deploy the command in debug server.",
        },
    ],
    example: [
        {
            command: "deploy",
            arguments: [
                {
                    name: "command",
                    value: "blacklist",
                },
            ],
            description:
                'will deploy the command with name "blacklist" globally.',
        },
        {
            command: "deploy",
            arguments: [
                {
                    name: "command",
                    value: "help",
                },
                {
                    name: "debug",
                    value: true,
                },
            ],
            description:
                'will deploy the command with name "help" in debug server.',
        },
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL",
};
