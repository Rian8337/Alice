import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AnniversaryReviewType } from "@alice-enums/utils/AnniversaryReviewType";
import { AnniversaryPastAttemptLocalization } from "@alice-localization/interactions/buttons/Anniversary/anniversaryPastAttempt/AnniversaryPastAttemptLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryPastAttemptLocalization(
        CommandHelper.getLocale(interaction),
    );

    const attemptIndex = parseInt(interaction.customId.split("#")[1]);

    if (Number.isNaN(attemptIndex)) {
        // No index has been selected - prompt the user.
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createWarn(
                localization.getTranslation("selectIndex"),
            ),
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("anniversaryPastAttempt#1")
                        .setLabel("1")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("anniversaryPastAttempt#2")
                        .setLabel("2")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("anniversaryPastAttempt#3")
                        .setLabel("3")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("anniversaryPastAttempt#4")
                        .setLabel("4")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("anniversaryPastAttempt#5")
                        .setLabel("5")
                        .setStyle(ButtonStyle.Primary),
                ),
            ],
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player =
        await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.getFromId(
            interaction.user.id,
            { projection: { _id: 0, pastAttempts: 1 } },
        );

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noPastAttempts"),
            ),
        });
    }

    if (attemptIndex > player.pastAttempts.length) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noPastAttempt"),
            ),
        });
    }

    const firstQuestion = CacheManager.anniversaryTriviaQuestions.first()!;

    InteractionHelper.reply(
        interaction,
        player.toReviewMessage(
            interaction.member,
            firstQuestion,
            attemptIndex,
            localization.language,
            AnniversaryReviewType.past,
        ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
