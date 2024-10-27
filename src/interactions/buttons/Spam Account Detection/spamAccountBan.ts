import { SpamAccountBanLocalization } from "@localization/interactions/buttons/Spam Account Detection/spamAccountBan/SpamAccountBanLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    await InteractionHelper.deferReply(interaction);

    const localization = new SpamAccountBanLocalization(
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
                localization.getTranslation("confirmBan"),
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

    const banned = await member
        .ban({
            reason: "Flagged as alternate account/engaged in suspected spam activity",
        })
        .then(() => true)
        .catch(() => false);

    if (banned) {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("banSuccess"),
                member.toString(),
            ),
        });
    } else {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("banFailed"),
                member.toString(),
            ),
        });
    }
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
