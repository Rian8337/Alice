import { DatabaseManager } from "@alice-database/DatabaseManager";
import { FancyApplicationStatus } from "@alice-enums/utils/FancyApplicationStatus";
import { Symbols } from "@alice-enums/utils/Symbols";
import { FancyApplicationInitiateVoteLocalization } from "@alice-localization/interactions/buttons/Fancy Application/fancyApplicationInitiateVote/FancyApplicationInitiateVoteLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const run: ButtonCommand["run"] = async (client, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    if (!interaction.inCachedGuild() || !interaction.channel) {
        return;
    }

    const localization = new FancyApplicationInitiateVoteLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const user = await client.users.fetch(interaction.customId.split("#")[1]);

    const application =
        await DatabaseManager.aliceDb.collections.fancyApplication.getByUserId(
            user.id,
        );

    if (application?.status !== FancyApplicationStatus.pendingApproval) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("applicationNotPending"),
            ),
        });
    }

    // Create vote message for user that ends in 3 days
    const voteEndTime = interaction.createdTimestamp + 3 * 24 * 60 * 60 * 1000;

    const voteMessage = await interaction.channel.send({
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`registerFancyVote#${user.id}#1`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(Symbols.checkmark)
                    .setLabel(localization.getTranslation("fancyVoteYes")),
                new ButtonBuilder()
                    .setCustomId(`registerFancyVote#${user.id}#0`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(Symbols.cross)
                    .setLabel(localization.getTranslation("fancyVoteNo")),
            ),
        ],
        embeds: [
            EmbedCreator.createNormalEmbed({
                author: interaction.user,
                color: "Orange",
            })
                .setTitle(localization.getTranslation("voteEmbedTitle"))
                .setDescription(
                    StringHelper.formatString(
                        localization.getTranslation("voteEmbedDescription"),
                        user.toString(),
                        `<t:${Math.floor(voteEndTime / 1000)}:F>`,
                        `<t:${Math.floor(voteEndTime / 1000)}:R>`,
                    ),
                ),
        ],
    });

    await voteMessage.pin("Vote started");

    const result =
        await DatabaseManager.aliceDb.collections.fancyApplication.updateOne(
            { discordId: user.id },
            {
                $set: {
                    status: FancyApplicationStatus.inVote,
                    vote: {
                        startsAt: interaction.createdAt,
                        endsAt: new Date(voteEndTime),
                        messageId: voteMessage.id,
                        votes: [],
                    },
                },
            },
        );

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("voteCreationFailed"),
                result.reason,
            ),
        });
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("voteCreationSuccess"),
        ),
    });

    const userLocalization = new FancyApplicationInitiateVoteLocalization(
        CommandHelper.getLocale(user),
    );

    try {
        await user.send({
            content: MessageCreator.createAccept(
                userLocalization.getTranslation("userNotification"),
            ),
        });
    } catch {
        /* empty */
    }
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
