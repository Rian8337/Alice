import { SpamAccountKickLocalization } from "@alice-localization/interactions/buttons/Spam Account Detection/spamAccountKick/SpamAccountKickLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    await InteractionHelper.deferReply(interaction);

    const localization = new SpamAccountKickLocalization(
        CommandHelper.getLocale(interaction),
    );

    const userId = interaction.customId.split("#")[1];
    const member = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);

    if (!member) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotFound"),
            ),
        });
    }

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("confirmKick"),
                member.toString(),
            ),
        },
        [interaction.user.id],
        15,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    const kicked = await member
        .kick("Flagged as alternate account/engaged in suspected spam activity")
        .then(() => true)
        .catch(() => false);

    if (kicked) {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("kickSuccess"),
                member.toString(),
            ),
        });
    } else {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("kickFailed"),
                member.toString(),
            ),
        });
    }
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
