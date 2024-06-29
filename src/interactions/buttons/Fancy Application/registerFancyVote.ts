import { DatabaseManager } from "@alice-database/DatabaseManager";
import { RegisterFancyVoteLocalization } from "@alice-localization/interactions/buttons/Fancy Application/registerFancyVote/RegisterFancyVoteLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new RegisterFancyVoteLocalization(
        CommandHelper.getLocale(interaction),
    );

    const split = interaction.customId.split("#");
    const userId = split[1];
    const votedYes = split[2] === "1";

    if (!votedYes) {
        return ModalCreator.createModal(
            interaction,
            `fancyVoteNoReason#${userId}`,
            localization.getTranslation("submitReasonModalTitle"),
            new TextInputBuilder()
                .setCustomId("reason")
                .setLabel(localization.getTranslation("submitReasonModalLabel"))
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(4000)
                .setPlaceholder(
                    localization.getTranslation("submitReasonModalPlaceholder"),
                ),
        );
    }

    await InteractionHelper.deferReply(interaction);

    const vote =
        await DatabaseManager.aliceDb.collections.fancyApplication.getByUserId(
            userId,
        );

    if (!vote) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("voteNotFound"),
            ),
        });
    }

    const result = await vote.registerVote(interaction.user.id, true);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("voteRegistrationFailed"),
            ),
        });
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("voteRegistrationSuccess"),
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
