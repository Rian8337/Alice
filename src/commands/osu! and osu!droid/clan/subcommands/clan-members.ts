import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanCollectionManager } from "@alice-database/managers/elainaDb/ClanCollectionManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { ClanMember } from "@alice-interfaces/clan/ClanMember";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildMember, MessageEmbed } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const dbManager: ClanCollectionManager =
        DatabaseManager.elainaDb.collections.clan;

    const clan: Clan | null = interaction.options.getString("name")
        ? await dbManager.getFromName(
              interaction.options.getString("name", true)
          )
        : await dbManager.getFromUser(interaction.user);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                interaction.options.getString("name")
                    ? clanStrings.clanDoesntExist
                    : clanStrings.selfIsNotInClan
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color:
            (await clan.getClanRole())?.color ??
            (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(`${clan.name} Members`);

    if (clan.iconURL) {
        embed.setThumbnail(clan.iconURL);
    }

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: ClanMember[]
    ) => {
        embed.setDescription(
            contents
                .slice(5 * (page - 1), 5 + 5 * (page - 1))
                .map(
                    (v, i) =>
                        `**${5 * (page - 1) + i + 1}. <@${v.id}> (#${
                            v.rank
                        })**\n` +
                        `**Discord ID**: ${v.id}\n` +
                        `**Uid**: ${v.uid}\n` +
                        `**Role**: ${
                            v.hasPermission
                                ? `${
                                      v.id === clan.leader
                                          ? "Leader"
                                          : "Co-Leader"
                                  }`
                                : "Member"
                        }\n` +
                        `**Upkeep Value**: ${clan.calculateUpkeep(
                            v.id
                        )} Alice coins`
                )
                .join("\n\n")
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...clan.member_list.values()],
        5,
        1,
        90,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
