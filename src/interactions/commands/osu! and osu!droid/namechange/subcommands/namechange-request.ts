import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { NamechangeLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/namechange/NamechangeLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: NamechangeLocalization = new NamechangeLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(
            bindInfo.uid
        );

    if (nameChange) {
        if (!nameChange.isProcessed) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("activeRequestExists")
                ),
            });
        }

        if (nameChange?.cooldown > Math.floor(Date.now() / 1000)) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("requestCooldownNotExpired"),
                    DateTimeFormatHelper.dateToLocaleString(
                        new Date(nameChange.cooldown * 1000),
                        localization.language
                    )
                ),
            });
        }
    }

    await InteractionHelper.deferReply(interaction);

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("currentBindedAccountDoesntExist")
            ),
        });
    }

    const email: string = interaction.options.getString("email", true).trim();

    if (email !== player.email) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("emailNotEqualToBindedAccount")
            ),
        });
    }

    const newUsername: string = interaction.options.getString(
        "newusername",
        true
    );

    if (
        StringHelper.hasUnicode(newUsername) ||
        !/^[a-zA-Z0-9_]+$/.test(newUsername)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("newUsernameContainsUnicode")
            ),
        });
    }

    if (!NumberHelper.isNumberInRange(newUsername.length, 2, 20, true)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("newUsernameTooLong")
            ),
        });
    }

    const newPlayer: Player | null = await Player.getInformation(newUsername);

    if (newPlayer) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("newNameAlreadyTaken")
            ),
        });
        2;
    }

    await DatabaseManager.aliceDb.collections.nameChange.requestNameChange(
        interaction.user.id,
        bindInfo.uid,
        player.username,
        newUsername
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("requestSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
