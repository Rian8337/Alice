import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseProfileBackground } from "@alice-interfaces/database/aliceDb/DatabaseProfileBackground";
import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { Collection, GuildMember, MessageEmbed } from "discord.js";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";

export const run: Subcommand["run"] = async (client, interaction) => {
    const backgrounds: Collection<string, ProfileBackground> = await DatabaseManager.aliceDb.collections.profileBackgrounds.get("id");

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(interaction.user);

    const ownedBackgrounds: ProfileBackground[] = (playerInfo?.picture_config.backgrounds ?? []).map(v => new ProfileBackground(client, v));

    const onPageChange: OnButtonPageChange = async (options, page, backgrounds: ProfileBackground[]) => {
        const embed: MessageEmbed = <MessageEmbed> options.embeds![0];

        for (let i = 10 * (page - 1); i < Math.min(backgrounds.length, 10 * 10 * (page - 1)); ++i) {
            const bg: ProfileBackground = backgrounds[i];
            embed.addField(`${i + 1}. ${bg.name}`, `Owned: **${ownedBackgrounds.find(v => v.id === bg.id) ? "Yes" : "No"}**`);
        }

        options.embeds![0] = embed;
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        {
            embeds: [ EmbedCreator.createNormalEmbed(
                { author: interaction.user, color: (<GuildMember | null> interaction.member)?.displayColor }
            ) ]
        },
        [interaction.user.id],
        [...backgrounds.values()],
        10,
        1,
        60,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: []
};