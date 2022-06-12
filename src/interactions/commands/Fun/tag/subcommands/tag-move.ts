import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { TagLocalization } from "@alice-localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { User } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const oldUser: User = interaction.options.getUser("olduser", true);

    const newUser: User = interaction.options.getUser("newuser", true);

    await DatabaseManager.aliceDb.collections.guildTags.update(
        {
            guildid: interaction.guildId,
            author: oldUser.id,
        },
        {
            $set: {
                author: newUser.id,
            },
        }
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new TagLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("transferTagSuccessful"),
            oldUser.toString(),
            newUser.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
