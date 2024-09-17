import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SkinPreviewType } from "@alice-enums/utils/SkinPreviewType";
import { SkinLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/skin/SkinLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization = new SkinLocalization(
        CommandHelper.getLocale(interaction),
    );

    const skin =
        await DatabaseManager.aliceDb.collections.playerSkins.getFromName(
            interaction.options.getString("name", true),
        );

    if (!skin) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("skinNotFound"),
            ),
        });
    }

    if (
        // Allow bot owners to edit skins.
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        skin.discordid !== interaction.user.id
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("skinNotOwnedByUser"),
            ),
        });
    }

    const type = <SkinPreviewType>interaction.options.getString("type", true);
    const image = interaction.options.getAttachment("image");

    let needsUpdating = false;

    if (image) {
        if (image.size > 8e6) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("previewImageTooBig"),
                ),
            });
        }

        if (!image.height) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("invalidPreviewImage"),
                ),
            });
        }

        skin.previews ??= {};

        await InteractionHelper.deferReply(interaction);

        const skinChannel = await client.channels.fetch(
            Constants.skinPreviewChannel,
        );

        if (!skinChannel?.isSendable()) {
            return;
        }

        const message = await skinChannel.send({
            content: `Preview type: ${type}`,
            files: [image],
        });

        // Delete the previous message.
        if (skin.previews[type]) {
            await skinChannel.messages.delete(skin.previews[type]!.messageId);
        }

        skin.previews[type] = {
            messageId: message.id,
            attachmentURL: message.attachments.first()!.url,
        };

        needsUpdating = true;
    } else if (skin.previews?.[type]) {
        needsUpdating = true;

        await InteractionHelper.deferReply(interaction);

        const skinChannel = await client.channels.fetch(
            Constants.skinPreviewChannel,
        );

        if (!skinChannel?.isTextBased()) {
            return;
        }

        // Delete the previous message.
        await skinChannel.messages.delete(skin.previews[type]!.messageId);

        delete skin.previews[type];

        if (Object.keys(skin.previews).length === 0) {
            delete skin.previews;
        }
    }

    if (needsUpdating) {
        const result =
            await DatabaseManager.aliceDb.collections.playerSkins.updateOne(
                { name: skin.name },
                skin.previews
                    ? {
                          $set: {
                              previews: skin.previews,
                          },
                      }
                    : {
                          $unset: {
                              previews: "",
                          },
                      },
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("editSkinFailed"),
                    result.reason!,
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("editSkinSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
