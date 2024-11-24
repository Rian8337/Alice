import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { UndeployLocalization } from "@localization/interactions/commands/Bot Creators/undeploy/UndeployLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (client, interaction) => {
    const localization = new UndeployLocalization(
        CommandHelper.getLocale(interaction),
    );

    const commandName = interaction.options.getString("command", true);
    const isDebug = interaction.options.getBoolean("serveronly") ?? false;

    if (isDebug) {
        if (!interaction.inCachedGuild()) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("commandNotFound"),
                ),
            });
        }

        await interaction.guild.commands.fetch();
    } else {
        await client.application.commands.fetch();
    }

    const command = (
        isDebug ? interaction.guild : client.application
    )?.commands.cache.find((v) => v.name === commandName);

    if (!command) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound"),
            ),
        });
    }

    await (isDebug ? interaction.guild : client.application)?.commands.delete(
        command,
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("commandUndeploySuccessful"),
            commandName,
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "undeploy",
    description: "Undeploys a command from Discord.",
    options: [
        {
            name: "command",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The command name.",
        },
        {
            name: "serveronly",
            type: ApplicationCommandOptionType.Boolean,
            description:
                "Whether to only undeploy the command in the server this command is executed in.",
        },
    ],
    example: [
        {
            command: "undeploy command:blacklist",
            arguments: [
                {
                    name: "command",
                    value: "blacklist",
                },
            ],
            description:
                'will undeploy the command with name "blacklist" globally.',
        },
        {
            command: "undeploy command:help debug:True",
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
                'will undeploy the command with name "help" in debug server.',
        },
    ],
    permissions: ["BotOwner"],
    scope: "ALL",
    replyEphemeral: true,
};
