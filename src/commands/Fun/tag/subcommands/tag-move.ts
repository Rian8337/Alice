import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { tagStrings } from "../tagStrings";

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
            tagStrings.transferTagSuccessful,
            oldUser.toString(),
            newUser.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
