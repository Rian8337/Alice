import { Collection, GuildMember, MessageEmbed } from "discord.js";
import { Bot } from "@alice-core/Bot";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { helpStrings } from "./helpStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

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
    const commandName: string | null = interaction.options.getString("commandname");

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember | null> interaction.member)?.displayColor }
    );

    if (commandName) {
        const cmd: Command | undefined = client.commands.get(commandName);

        if (!cmd) {
            return interaction.editReply({
                content: MessageCreator.createReject(helpStrings.noCommandFound)
            });
        }

        let argsString: string = "";

        if (cmd.config.options.length > 0) {
            const finalMappedArgs: string[] = [];
            const mappedArgs: string[] = [];
            const precedingKeywords: string[] = [];
            let isOptional: boolean = false;

            for (const arg of cmd.config.options) {
                switch (arg.type) {
                    case CommandArgumentType.SUB_COMMAND_GROUP:
                    case CommandArgumentType.SUB_COMMAND:
                        precedingKeywords.push(arg.name);
                        for (const localArg of (arg.options ?? [])) {
                            precedingKeywords.push(localArg.name);
                        }
                    case CommandArgumentType.BOOLEAN:
                    default:
                        isOptional ||= !arg.required;

                        if (isOptional) {
                            mappedArgs.push(`[${arg.name}]`);
                        } else {
                            mappedArgs.push(`<${arg.name}>`);
                        }
                }

                finalMappedArgs.push(`${precedingKeywords.join(" ")} ${mappedArgs.join(" ")}`);
            }

            argsString += finalMappedArgs.map(v => v.trim()).join(" | ");
        }

        embed.setTitle(cmd.config.name)
            .setDescription(
                "```md\n" + `${cmd.config.description}` + "```" +
                "Category: " + "`" + cmd.category + "`\n" +
                "Required Permissions: `" + PermissionHelper.getPermissionString(cmd.config.permissions) + "`"
            )
            .addField(
                "Examples",
                cmd.config.example.map(v =>
                    `\`/${v.command}\`\n` +
                    v.description
                ).join("\n\n") || "None",
                true
            )
            .addField(
                "Usage\n" +
                "`<...>`: required\n" +
                "`[...]`: optional\n\n" +
                `\`${cmd.config.name} ${argsString}\``,
                "**Details**\n" +
                cmd.config.options.map(v =>
                    "`" + v.name + "`: *" + (<string> v.type).split("_").map(v => StringHelper.capitalizeString(v, true)).join(" ") + "*\n" +
                    v.description
                ).join("\n\n") || "None",
                true
            );

        interaction.editReply({ embeds: [embed] });
    } else {
        const commandList: Collection<string, string[]> = getCommandList(client);

        embed.setTitle("Alice Synthesis Thirty Help")
            .setDescription(
                "Made by <@132783516176875520> and <@386742340968120321>.\n\n" +
                "For detailed information about a command, use `/help [command name]`.\n" + 
                "If you encounter any bugs or issues with the bot, please contact bot creators."
            )
            .setThumbnail(<string> client.user?.avatarURL({dynamic: true}));

        const onPageChange: OnButtonPageChange = async (_, page, contents: { key: string, value: string[] }[]) => {
            const list: { key: string, value: string[] } = contents[page - 1];

            embed.addField(
                `**Category**: ${list.key}`,
                list.value.map(v => `\`${v}\``).join(" • ")
            );
        };

        MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [embed] },
            [interaction.user.id],
            ArrayHelper.collectionToArray(commandList),
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
            type: CommandArgumentType.STRING,
            description: "The command to see the help section from. If unspecified, lists all available commands."
        }
    ],
    example: [
        {
            command: "help",
            description: "will output all commands that I have."
        },
        {
            command: "help ping",
            description: "will output the help section of `ping` command."
        }
    ],
    permissions: [],
    replyEphemeral: true,
    scope: "ALL"
};