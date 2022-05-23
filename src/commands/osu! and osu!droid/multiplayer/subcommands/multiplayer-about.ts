import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    InteractionHelper.reply(interaction, {
        embeds: [
            EmbedCreator.createNormalEmbed({
                author: interaction.user,
                color: (<GuildMember | null>interaction.member)?.displayColor,
            }).setDescription(
                StringHelper.formatString(
                    localization.getTranslation("about"),
                    "https://gist.github.com/Rian8337/9be846b71665a8364bf5428d850e24bb"
                )
            ),
        ],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
