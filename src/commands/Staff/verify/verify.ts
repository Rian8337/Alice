import {
    Collection,
    GuildMember,
    Role,
    Snowflake,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { Config } from "@alice-core/Config";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { VerifyLocalization } from "@alice-localization/commands/Staff/verify/VerifyLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Command["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: VerifyLocalization = new VerifyLocalization(language);

    if (
        !(<GuildMember>interaction.member).roles.cache.hasAny(
            ...Config.verifyPerm
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.noPermissionReject
                )
            ),
        });
    }

    if (
        !(interaction.channel instanceof ThreadChannel) ||
        interaction.channel.parentId !== Constants.verificationChannel
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotAvailableInChannel")
            ),
        });
    }

    const toVerify: GuildMember = await interaction.guild!.members.fetch(
        interaction.options.getUser("user", true)
    );

    await interaction.channel!.members.fetch();

    if (!interaction.channel!.members.cache.has(toVerify.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotInThread")
            ),
        });
    }

    const onVerificationRole: Role = interaction.guild!.roles.cache.find(
        (v) => v.name === "On Verification"
    )!;

    const memberRole: Role = interaction.guild!.roles.cache.find(
        (r) => r.name === "Member"
    )!;

    if (!toVerify.roles.cache.has(onVerificationRole.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotInVerification")
            ),
        });
    }

    if (toVerify.roles.cache.has(memberRole.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsAlreadyVerifiedError")
            ),
        });
    }

    const roles: Collection<Snowflake, Role> = toVerify.roles.cache;

    roles.delete(onVerificationRole.id);

    roles.set(memberRole.id, memberRole);

    await toVerify.roles.set(roles, "Verification");

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("verificationSuccess")
        ),
    });

    await interaction.channel.setLocked(true);

    await interaction.channel.setArchived(true, "Verification");

    const general: TextChannel = <TextChannel>(
        interaction.guild!.channels.cache.get(Constants.mainServer)
    );

    general.send({
        content: `Welcome ${
            (await DatabaseManager.elainaDb.collections.userBind.isUserBinded(
                toVerify.id
            ))
                ? "back "
                : ""
        }to ${interaction.guild!.name}, ${toVerify}!`,
        files: [Constants.welcomeImageLink],
    });
};

export const category: Command["category"] = CommandCategory.STAFF;

export const config: Command["config"] = {
    name: "verify",
    description:
        "Verifies a user. This command uses a special permission that cannot be modified.",
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to verify.",
        },
    ],
    example: [
        {
            command: "verify",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will verify Rian8337.",
        },
        {
            command: "verify",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description: "will verify the user with that Discord ID.",
        },
    ],
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL",
};
