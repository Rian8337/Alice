import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanCollectionManager } from "@alice-database/managers/elainaDb/ClanCollectionManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { ClanMember } from "@alice-interfaces/clan/ClanMember";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

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
                localization.getTranslation(
                    interaction.options.getString("name")
                        ? "clanDoesntExist"
                        : "selfIsNotInClan"
                )
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
                        `**${localization.getTranslation("discordId")}**: ${
                            v.id
                        }\n` +
                        `**Uid**: ${v.uid}\n` +
                        `**${localization.getTranslation(
                            "clanMemberRole"
                        )}**: ${
                            v.hasPermission
                                ? `${localization.getTranslation(
                                      v.id === clan.leader
                                          ? "clanMemberRoleLeader"
                                          : "clanMemberRoleCoLeader"
                                  )}`
                                : localization.getTranslation(
                                      "clanMemberRoleMember"
                                  )
                        }\n` +
                        `**${localization.getTranslation(
                            "clanUpkeepInformation"
                        )}**: ${clan.calculateUpkeep(v.id)} Alice coins`
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
