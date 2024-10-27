import { DatabaseManager } from "@database/DatabaseManager";
import { OnboardingPlayerProfileActionLocalization } from "@localization/interactions/buttons/Onboarding/onboardingPlayerProfileAction/OnboardingPlayerProfileActionLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ProfileManager } from "@utils/managers/ProfileManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization = new OnboardingPlayerProfileActionLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const bindInfo =
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
            },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotBinded"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(bindInfo.uid, [
        "id",
        "username",
        "score",
        "playcount",
        "accuracy",
        "region",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const profileImage = (await ProfileManager.getProfileStatistics(
        bindInfo.uid,
        player,
        bindInfo,
        undefined,
        false,
        localization.language,
    ))!;

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("viewingProfile"),
            player.username,
            ProfileManager.getProfileLink(bindInfo.uid).toString(),
        ),
        files: [profileImage],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
