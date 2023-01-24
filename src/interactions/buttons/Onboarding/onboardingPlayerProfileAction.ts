import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OnboardingPlayerProfileActionLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingPlayerProfileAction/OnboardingPlayerProfileActionLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: OnboardingPlayerProfileActionLocalization =
        new OnboardingPlayerProfileActionLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                    pptotal: 1,
                    clan: 1,
                    weightedAccuracy: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotBinded")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    const profileImage: Buffer = (await ProfileManager.getProfileStatistics(
        player.uid,
        player,
        bindInfo,
        undefined,
        false,
        localization.language
    ))!;

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("viewingProfile"),
            player.username,
            ProfileManager.getProfileLink(player.uid).toString()
        ),
        files: [profileImage],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
