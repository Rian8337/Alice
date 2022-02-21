import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Language } from "@alice-localization/base/Language";
import { NamechangeLocalization } from "@alice-localization/commands/osu! and osu!droid/NamechangeLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: NamechangeLocalization = new NamechangeLocalization(
        language
    );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
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
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("activeRequestExists")
                ),
            });
        }

        if (nameChange?.cooldown > Math.floor(Date.now() / 1000)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("requestCooldownNotExpired"),
                    new Date(nameChange.cooldown * 1000).toUTCString()
                ),
            });
        }
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("currentBindedAccountDoesntExist")
            ),
        });
    }

    const email: string = interaction.options.getString("email", true).trim();

    if (email !== player.email) {
        return interaction.editReply({
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
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("newUsernameContainsUnicode")
            ),
        });
    }

    if (!NumberHelper.isNumberInRange(newUsername.length, 2, 20, true)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("newUsernameTooLong")
            ),
        });
    }

    const newPlayer: Player = await Player.getInformation({
        username: newUsername,
    });

    if (newPlayer.username) {
        return interaction.editReply({
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

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("requestSuccess")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
