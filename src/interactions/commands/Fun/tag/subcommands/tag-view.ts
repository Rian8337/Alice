import { DatabaseManager } from "@database/DatabaseManager";
import { GuildTag } from "@database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { BaseMessageOptions } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name,
        );

    if (!tag) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntExist"),
            ),
        });
    }

    if (!tag.content && tag.attachments.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    "tagDoesntHaveContentAndAttachments",
                ),
            ),
        });
    }

    const options: BaseMessageOptions = {
        allowedMentions: {
            parse: [],
        },
    };

    if (tag.content) {
        options.content = tag.content;
    }

    if (tag.attachments) {
        options.files = tag.attachments;
    }

    InteractionHelper.reply(interaction, options);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
