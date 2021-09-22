import { GuildMember, Role, TextChannel } from "discord.js";
import { Config } from "@alice-core/Config";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { verifyStrings } from "./verifyStrings";

export const run: Command["run"] = async(_, interaction) => {
    if (!(<GuildMember> interaction.member).roles.cache.hasAny(...Config.verifyPerm)) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject)
        });
    }

    const toVerify: GuildMember = await interaction.guild!.members.fetch(interaction.options.getUser("user", true));

    const role: Role = interaction.guild!.roles.cache.find(r => r.name === "Member")!;

    if (toVerify.roles.cache.has(role.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(verifyStrings.userIsAlreadyVerifiedError)
        });
    }

    await toVerify.roles.add(role, "Verification");

    interaction.editReply({
        content: MessageCreator.createAccept(verifyStrings.verificationSuccess)
    });

    const general: TextChannel = <TextChannel> interaction.guild!.channels.cache.get(Constants.mainServer);

    general.send({
        content: `Welcome to ${interaction.guild!.name}, ${toVerify}!`,
        files: [ Constants.welcomeImageLink ]
    });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "verify",
    description: "Verifies a user. This command uses a special permission that cannot be modified.",
    options: [
        {
            name: "user",
            required: true,
            type: CommandArgumentType.USER,
            description: "The user to verify."
        }
    ],
    example: [
        {
            command: "verify",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001"
                }
            ],
            description: "will verify Rian8337."
        },
        {
            command: "verify",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520"
                }
            ],
            description: "will verify the user with that Discord ID."
        }
    ],
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL"
};