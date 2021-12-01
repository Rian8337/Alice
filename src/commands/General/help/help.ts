import {
    ApplicationCommandOptionData,
    ApplicationCommandSubCommandData,
    ApplicationCommandSubGroupData,
    Collection,
    GuildMember,
    MessageEmbed,
} from "discord.js";
import { Bot } from "@alice-core/Bot";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { helpStrings } from "./helpStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

/**
 * Gets the list of commands that the bot has.
 *
 * @param client The instance of the bot.
 * @returns The list of commands, mapped by their category.
 */
function getCommandList(client: Bot): Collection<string, string[]> {
    const output: Collection<string, string[]> = new Collection();

    for (const cmd of client.commands.values()) {
        const category: string[] = output.get(cmd.category) ?? [];

        category.push(cmd.config.name);

        output.set(cmd.category, category);
    }

    return output;
}

export const run: Command["run"] = async (client, interaction) => {
    const commandName: string | null =
        interaction.options.getString("commandname");

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    if (commandName) {
        const cmd: Command | undefined = client.commands.get(commandName);

        if (!cmd) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    helpStrings.noCommandFound
                ),
            });
        }

        let argsString: string = "";

        if (cmd.config.options.length > 0) {
            const finalMappedArgs: string[] = [];

            for (const arg of cmd.config.options) {
                const mappedArgs: string[] = [];
                const precedingKeywords: string[] = [];
                let isOptional: boolean = false;

                switch (arg.type) {
                    case ApplicationCommandOptionTypes.SUB_COMMAND_GROUP:
                        precedingKeywords.push(arg.name);
                        for (const localArg of arg.options ?? []) {
                            precedingKeywords.push(localArg.name);
                            for (const localLocalArg of localArg.options ??
                                []) {
                                isOptional ||= !localLocalArg.required;

                                if (isOptional) {
                                    mappedArgs.push(`[${localLocalArg.name}]`);
                                } else {
                                    mappedArgs.push(`<${localLocalArg.name}>`);
                                }
                            }
                        }
                        break;
                    case ApplicationCommandOptionTypes.SUB_COMMAND:
                        precedingKeywords.push(arg.name);
                        for (const localArg of arg.options ?? []) {
                            isOptional ||= !localArg.required;

                            if (isOptional) {
                                mappedArgs.push(`[${localArg.name}]`);
                            } else {
                                mappedArgs.push(`<${localArg.name}>`);
                            }
                        }
                        break;
                    default:
                        isOptional ||= !(<
                            Exclude<
                                ApplicationCommandOptionData,
                                | ApplicationCommandSubGroupData
                                | ApplicationCommandSubCommandData
                            >
                        >arg).required;

                        if (isOptional) {
                            mappedArgs.push(`[${arg.name}]`);
                        } else {
                            mappedArgs.push(`<${arg.name}>`);
                        }
                }

                finalMappedArgs.push(
                    `[ ${precedingKeywords.join(" ")} ${mappedArgs.join(" ")} ]`
                );
            }

            argsString += finalMappedArgs.map((v) => v.trim()).join(" | ");
        }

        embed
            .setTitle(cmd.config.name)
            .setDescription(
                "```md\n" +
                    `${cmd.config.description}` +
                    "```\n" +
                    "Category: " +
                    "`" +
                    cmd.category +
                    "`\n" +
                    "Required Permissions: `" +
                    PermissionHelper.getPermissionString(
                        cmd.config.permissions
                    ) +
                    "`"
            )
            .addField(
                "Examples",
                cmd.config.example
                    .map(
                        (v) =>
                            `\`/${v.command}\`${
                                v.arguments
                                    ? ` ${v.arguments
                                          .map(
                                              (a) => `\`${a.name}:${a.value}\``
                                          )
                                          .join(" ")}`
                                    : ""
                            }\n` + v.description
                    )
                    .join("\n\n") || "None",
                true
            )
            .addField(
                "Usage\n" +
                    "`<...>`: required\n" +
                    "`[...]`: optional\n\n" +
                    `\`${cmd.config.name}${
                        argsString ? ` ${argsString}` : ""
                    }\``,
                "**Details**\n" +
                    cmd.config.options
                        .map(
                            (v) =>
                                "`" +
                                v.name +
                                "`: *" +
                                CommandHelper.optionTypeToString(
                                    <ApplicationCommandOptionTypes>v.type
                                ) +
                                "*\n" +
                                v.description
                        )
                        .join("\n\n") || "None",
                true
            );

        interaction.editReply({ embeds: [embed] });
    } else {
        const commandList: Collection<string, string[]> =
            getCommandList(client);

        embed
            .setTitle("Alice Synthesis Thirty Help")
            .setDescription(
                "Made by <@132783516176875520> and <@386742340968120321>.\n\n" +
                    "For detailed information about a command, use `/help [command name]`.\n" +
                    "If you encounter any bugs or issues with the bot, please contact bot creators."
            )
            .setThumbnail(client.user!.avatarURL({ dynamic: true })!);

        const onPageChange: OnButtonPageChange = async (_, page) => {
            embed.addField(
                `**Category**: ${commandList.keyAt(page - 1)}`,
                commandList
                    .at(page - 1)!
                    .map((v) => `\`${v}\``)
                    .join(" • ")
            );
        };

        MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [embed] },
            [interaction.user.id],
            [...commandList.values()],
            1,
            1,
            120,
            onPageChange
        );
    }
};

export const category: Command["category"] = CommandCategory.GENERAL;

export const config: Command["config"] = {
    name: "help",
    description: "General help command.",
    options: [
        {
            name: "commandname",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The command to see the help section from. If unspecified, lists all available commands.",
        },
    ],
    example: [
        {
            command: "help",
            arguments: [],
            description: "will output all commands that I have.",
        },
        {
            command: "help",
            arguments: [
                {
                    name: "commandname",
                    value: "ping",
                },
            ],
            description: "will output the help section of `ping` command.",
        },
    ],
    permissions: [],
    replyEphemeral: true,
    scope: "ALL",
};
