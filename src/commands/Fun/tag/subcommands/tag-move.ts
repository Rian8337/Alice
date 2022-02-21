import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { TagLocalization } from "@alice-localization/commands/Fun/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
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

    interaction.editReply({
        content: MessageCreator.createAccept(
            new TagLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("transferTagSuccessful"),
            oldUser.toString(),
            newUser.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
