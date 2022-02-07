import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ClanMember } from "@alice-interfaces/clan/ClanMember";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { User } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const type: "battle" | "join" = <"battle" | "join">(
        interaction.options.getString("type", true)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                interaction.options.getUser("user")
                    ? Constants.userNotBindedReject
                    : Constants.selfNotBindedReject
            ),
        });
    }

    switch (type) {
        case "battle": {
            if (!bindInfo.clan) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        interaction.options.getUser("user")
                            ? clanStrings.userIsNotInClan
                            : clanStrings.selfIsNotInClan
                    ),
                });
            }

            const clan: Clan =
                (await DatabaseManager.elainaDb.collections.clan.getFromUser(
                    user
                ))!;

            const member: ClanMember = clan.member_list.get(user.id)!;

            const battleCooldownDifference: number =
                DateTimeFormatHelper.getTimeDifference(member.battle_cooldown);

            if (battleCooldownDifference > 0) {
                interaction.editReply({
                    content: MessageCreator.createAccept(
                        clanStrings.userInBattleCooldown,
                        interaction.options.getUser("user")
                            ? "The user"
                            : "You",
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.ceil(battleCooldownDifference / 1000)
                        )
                    ),
                });
            } else {
                interaction.editReply({
                    content: MessageCreator.createAccept(
                        clanStrings.userNotInBattleCooldown,
                        interaction.options.getUser("user")
                            ? "The user is"
                            : "You are"
                    ),
                });
            }

            break;
        }
        case "join": {
            if (bindInfo.clan) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        clanStrings.userIsAlreadyInClan
                    ),
                });
            }

            const responses: string[] = [];

            const oldJoinCooldownDifference =
                DateTimeFormatHelper.getTimeDifference(
                    (bindInfo.oldjoincooldown ?? 0) * 1000
                );

            if (oldJoinCooldownDifference > 0) {
                responses.push(
                    MessageCreator.createAccept(
                        clanStrings.userInOldJoinCooldown,
                        interaction.options.getUser("user")
                            ? "The user"
                            : "You",
                        interaction.options.getUser("user") ? "their" : "your",
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.ceil(oldJoinCooldownDifference / 1000)
                        ).toString()
                    )
                );
            } else {
                responses.push(
                    MessageCreator.createAccept(
                        clanStrings.userNotInOldJoinCooldown,
                        interaction.options.getUser("user")
                            ? "The user is"
                            : "You are",
                        interaction.options.getUser("user") ? "their" : "your"
                    )
                );
            }

            const joinCooldownDifference: number =
                DateTimeFormatHelper.getTimeDifference(
                    (bindInfo.joincooldown ?? 0) * 1000
                );

            if (joinCooldownDifference > 0) {
                responses.push(
                    MessageCreator.createAccept(
                        clanStrings.userInJoinCooldown,
                        interaction.options.getUser("user")
                            ? "The user"
                            : "You",
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.ceil(joinCooldownDifference / 1000)
                        ).toString()
                    )
                );
            } else {
                responses.push(
                    MessageCreator.createAccept(
                        clanStrings.userNotInJoinCooldown,
                        interaction.options.getUser("user")
                            ? "The user is"
                            : "You are"
                    )
                );
            }

            interaction.editReply({
                content: responses.join("\n"),
            });

            break;
        }
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
