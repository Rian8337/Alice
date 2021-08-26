import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, User } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const oldUser: User = interaction.options.getUser("olduser", true);

    const newUser: User = interaction.options.getUser("newuser", true);

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    if (!tags.find(v => v.author === oldUser.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                tagsStrings.userDoesntHaveTags,
                "this user"
            )
        });
    }

    tags.forEach(tag => {
        if (tag.author === oldUser.id) {
            tag.author = newUser.id;
        }
    });

    await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

    interaction.editReply({
        content: MessageCreator.createAccept(tagsStrings.transferTagSuccessful, oldUser.toString(), newUser.toString())
    });
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"]
};