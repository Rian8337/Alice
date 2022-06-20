import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ClanMember } from "@alice-interfaces/clan/ClanMember";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const type: "battle" | "join" = <"battle" | "join">(
        interaction.options.getString("type", true)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    interaction.options.getUser("user")
                        ? Constants.userNotBindedReject
                        : Constants.selfNotBindedReject
                )
            ),
        });
    }

    switch (type) {
        case "battle": {
            if (!bindInfo.clan) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userIsNotInClan"
                                : "selfIsNotInClan"
                        )
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
                InteractionHelper.reply(interaction, {
                    content: MessageCreator.createAccept(
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userInBattleCooldown"
                                : "selfInBattleCooldown"
                        ),
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.ceil(battleCooldownDifference / 1000)
                        )
                    ),
                });
            } else {
                InteractionHelper.reply(interaction, {
                    content: MessageCreator.createAccept(
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userNotInBattleCooldown"
                                : "selfNotInBattleCooldown"
                        )
                    ),
                });
            }

            break;
        }
        case "join": {
            if (bindInfo.clan) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userIsAlreadyInClan")
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
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userInOldJoinCooldown"
                                : "selfInOldJoinCooldown"
                        ),
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.ceil(oldJoinCooldownDifference / 1000)
                        ).toString()
                    )
                );
            } else {
                responses.push(
                    MessageCreator.createAccept(
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userNotInOldJoinCooldown"
                                : "selfNotInOldJoinCooldown"
                        )
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
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userInJoinCooldown"
                                : "selfInJoinCooldown"
                        ),
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.ceil(joinCooldownDifference / 1000)
                        ).toString()
                    )
                );
            } else {
                responses.push(
                    MessageCreator.createAccept(
                        localization.getTranslation(
                            interaction.options.getUser("user")
                                ? "userNotInJoinCooldown"
                                : "selfNotInJoinCooldown"
                        )
                    )
                );
            }

            InteractionHelper.reply(interaction, {
                content: responses.join("\n"),
            });

            break;
        }
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
