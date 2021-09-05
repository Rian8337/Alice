import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { Collection, GuildMember, MessageEmbed } from "discord.js";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";

export const run: Subcommand["run"] = async (_, interaction) => {
    const backgrounds: Collection<string, ProfileBackground> = await DatabaseManager.aliceDb.collections.profileBackgrounds.get("id");

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(interaction.user);

    const ownedBackgrounds: ProfileBackground[] = (playerInfo?.picture_config.backgrounds ?? [])
        .map(v => Object.assign(DatabaseManager.aliceDb.collections.profileBackgrounds.defaultInstance, v));

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember | null> interaction.member)?.displayColor }
    );

    const onPageChange: OnButtonPageChange = async (_, page, backgrounds: ProfileBackground[]) => {
        for (let i = 10 * (page - 1); i < Math.min(backgrounds.length, 10 * 10 * (page - 1)); ++i) {
            const bg: ProfileBackground = backgrounds[i];
            embed.addField(`${i + 1}. ${bg.name}`, `Owned: **${ownedBackgrounds.find(v => v.id === bg.id) ? "Yes" : "No"}**`);
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [ embed ] },
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