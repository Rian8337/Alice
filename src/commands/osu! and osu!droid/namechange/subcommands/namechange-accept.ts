import { MessageEmbed, User } from "discord.js";
import { DroidAPIRequestBuilder, RequestResponse } from "osu-droid";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { namechangeStrings } from "../namechangeStrings";
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

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(uid);

    if (!nameChange || nameChange.isProcessed) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.uidHasNoActiveRequest
            ),
        });
    }

    const currentUsername: string = nameChange.current_username;
    const newUsername: string = nameChange.new_username!;

    const user: User = await client.users.fetch(nameChange.discordid);

    const apiRequestBuilder: DroidAPIRequestBuilder =
        new DroidAPIRequestBuilder()
            .setEndpoint("rename.php")
            .addParameter("username", currentUsername)
            .addParameter("newname", newUsername);

    const result: RequestResponse = await apiRequestBuilder.sendRequest();

    if (result.statusCode !== 200) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.droidApiRequestFail),
        });
    }

    const content: string = result.data.toString("utf-8");
    const requestResult: string = <string>content.split(" ").shift();

    if (requestResult === "FAILED") {
        // Update database first, then we can deal with notifying the user
        await nameChange.deny();

        interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.newNameAlreadyTaken
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
                    `**Old Username**: ${currentUsername}\n` +
                        `**New Username**: ${nameChange.new_username}\n` +
                        `**Creation Date**: ${new Date(
                            (nameChange.cooldown - 86400 * 30) * 1000
                        ).toUTCString()}\n\n` +
                        "**Status**: Denied\n" +
                        "**Reason**: New username taken"
                );

            try {
                user.send({
                    content: MessageCreator.createReject(
                        namechangeStrings.denyUserNotification,
                        "new username taken"
                    ),
                    embeds: [embed],
                });
                // eslint-disable-next-line no-empty
            } catch {}
        }

        return;
    }

    // Update database that store name first, then we can deal with notifying the user
    await nameChange.accept();

    interaction.editReply({
        content: MessageCreator.createAccept(namechangeStrings.acceptSuccess),
    });

    if (user) {
        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            color: 2483712,
            timestamp: true,
        });

        embed
            .setTitle("Request Details")
            .setDescription(
                `**Old Username**: ${currentUsername}\n` +
                    `**New Username**: ${nameChange.new_username}\n` +
                    `**Creation Date**: ${new Date(
                        (nameChange.cooldown - 86400 * 30) * 1000
                    ).toUTCString()}\n\n` +
                    "**Status**: Accepted"
            );

        try {
            user.send({
                content: MessageCreator.createReject(
                    namechangeStrings.acceptUserNotification,
                    new Date(nameChange.cooldown * 1000).toUTCString()
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
