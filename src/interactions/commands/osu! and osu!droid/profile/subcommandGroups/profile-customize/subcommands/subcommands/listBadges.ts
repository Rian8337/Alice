import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { Collection, GuildMember, EmbedBuilder } from "discord.js";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { ProfileBadgeOwnerInfo } from "structures/interactions/commands/osu! and osu!droid/ProfileBadgeOwnerInfo";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { ProfileBadge } from "@database/utils/aliceDb/ProfileBadge";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { PartialProfileBackground } from "@structures/profile/PartialProfileBackground";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const badgeList: Collection<string, ProfileBadge> =
        await DatabaseManager.aliceDb.collections.profileBadges.getAllBadgesSorted();

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    "picture_config.badges": 1,
                },
            },
        );

    const userBadges: PartialProfileBackground[] =
        playerInfo?.picture_config.badges ?? [];

    const finalBadgeList: ProfileBadgeOwnerInfo[] = [];

    for (const badge of badgeList.values()) {
        finalBadgeList.push({
            ...badge,
            isOwned: !!userBadges.find((v) => v.id === badge.id),
        });
    }

    finalBadgeList.sort((a, b) => Number(b.isOwned) - Number(a.isOwned));

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(finalBadgeList.length, 5 + 5 * (page - 1));
            ++i
        ) {
            const c: ProfileBadgeOwnerInfo = finalBadgeList[i];

            embed.addFields({
                name: `${i + 1}. ${c.name} (\`${c.id}\`${
                    c.isOwned ? ", owned" : ""
                })`,
                // TODO: move description to bot-side instead of database
                value: `Rewarded for ${c.description}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(finalBadgeList.length / 5),
        150,
        onPageChange,
    );
};
