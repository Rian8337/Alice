import { MessageEmbed, User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { namechangeStrings } from "../namechangeStrings";
import { Constants } from "@alice-core/Constants";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";

export const run: Subcommand["run"] = async (client, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(namechangeStrings.invalidUid),
        });
    }

    const reason: string = interaction.options.getString("reason", true);

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(uid);

    if (!nameChange || nameChange.isProcessed) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.uidHasNoActiveRequest
            ),
        });
    }

    const user: User = await client.users.fetch(nameChange.discordid);

    // Update database first, then we can deal with notifying the user
    await nameChange.deny();

    interaction.editReply({
        content: MessageCreator.createAccept(
            namechangeStrings.denySuccess,
            reason
        ),
    });

    if (user) {
        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            color: 16711711,
            timestamp: true,
        });

        embed
            .setTitle("Request Details")
            .setDescription(
                `**Old Username**: ${nameChange.current_username}\n` +
                    `**New Username**: ${nameChange.new_username}\n` +
                    `**Creation Date**: ${new Date(
                        (nameChange.cooldown - 86400 * 30) * 1000
                    ).toUTCString()}\n\n` +
                    "**Status**: Denied\n" +
                    `**Reason**: ${reason}`
            );

        try {
            user.send({
                content: MessageCreator.createReject(
                    namechangeStrings.denyUserNotification,
                    reason
                ),
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    }
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
