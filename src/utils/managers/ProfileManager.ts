import { Player } from "@rian8337/osu-droid-utilities";
import { registerFont } from "canvas";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Manager } from "@alice-utils/base/Manager";
import { ProfileCardCreator } from "@alice-utils/creators/ProfileCardCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { Language } from "@alice-localization/base/Language";

/**
 * A manager for osu!droid accounts' profile.
 */
export abstract class ProfileManager extends Manager {
    /**
     * Initializes the manager.
     */
    static override init(): void {
        registerFont(`${process.cwd()}/files/fonts/Exo-Regular.ttf`, {
            family: "Exo",
        });
        registerFont(`${process.cwd()}/files/fonts/Exo-Bold.ttf`, {
            family: "Exo",
            weight: "bold",
        });
    }

    /**
     * Gets the statistics of a player.
     *
     * @param uid The uid of the player.
     * @param player The player instance, if available (this will save an API request towards the osu!droid server).
     * @param bindInfo The bind information, if available (this will save a request towards bot database).
     * @param playerInfo The database player information, if available (this will save a request towards bot database).
     * @param detailed Whether to give a detailed statistics.
     * @param language The locale of the user who attempted to get the player's statistics. Defaults to English.
     * @returns An image containing the player's statistics, `null` if the player is not found.
     */
    static async getProfileStatistics(
        uid: number,
        player?: Player,
        bindInfo?: UserBind | null,
        playerInfo?: PlayerInfo | null,
        rankedScoreInfo?: RankedScore | null,
        detailed: boolean = false,
        language: Language = "en"
    ): Promise<Buffer | null> {
        if (bindInfo === undefined) {
            bindInfo =
                await DatabaseManager.elainaDb.collections.userBind.getFromUid(
                    uid,
                    { retrieveAllPlays: true }
                );
        }

        if (rankedScoreInfo === undefined) {
            rankedScoreInfo =
                await DatabaseManager.aliceDb.collections.rankedScore.getFromUid(
                    uid
                );
        }

        if (!player) {
            const newPlayer: Player | null = await Player.getInformation(uid);

            if (!newPlayer) {
                return null;
            }

            player = newPlayer;
        }

        if (playerInfo === undefined && bindInfo) {
            playerInfo =
                await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
                    bindInfo.discordid,
                    {
                        projection: {
                            _id: 0,
                            picture_config: 1,
                        },
                    }
                );
        }

        return new ProfileCardCreator(
            player,
            detailed,
            bindInfo,
            rankedScoreInfo,
            playerInfo,
            language
        ).generateCard();
    }

    /**
     * Gets a link to a player's profile.
     *
     * @param uid The uid of the player.
     * @returns The link to the player's profile.
     */
    static getProfileLink(uid: number): URL {
        // TODO: maybe separate the host to an API request handler
        return new URL(`https://osudroid.moe/profile.php?uid=${uid}`);
    }

    /**
     * Gets profile statistics template of a player for badges.
     *
     * @param uid The uid of the player.
     * @param bindInfo The bind information of the player.
     * @param player The player instance, if available (this will save an API request towards the osu!droid server).
     * @param language The locale of the user who requested the profile template. Defaults to English.
     * @returns A profile statistics template.
     */
    static async getProfileTemplate(
        uid: number,
        bindInfo: UserBind,
        player?: Player,
        language: Language = "en"
    ): Promise<Buffer | null> {
        if (!player) {
            const newPlayer: Player | null = await Player.getInformation(uid);

            if (!newPlayer) {
                return null;
            }

            player = newPlayer;
        }

        return new ProfileCardCreator(
            player,
            false,
            bindInfo,
            undefined,
            undefined,
            language
        ).generateTemplateCard();
    }
}
