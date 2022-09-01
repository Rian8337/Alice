import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@alice-localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageOptions } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name
        );

    if (!tag) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntExist")
            ),
        });
    }

    if (!tag.content && tag.attachments.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    "tagDoesntHaveContentAndAttachments"
                )
            ),
        });
    }

    const options: MessageOptions = {
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
