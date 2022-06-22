import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseMapShare } from "@alice-interfaces/database/aliceDb/DatabaseMapShare";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MapShareSubmissionStatus } from "@alice-types/utils/MapShareSubmissionStatus";
import { Manager } from "@alice-utils/base/Manager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { ObjectId } from "bson";
import { MessageOptions, Snowflake, TextChannel } from "discord.js";
import { UserBind } from "../elainaDb/UserBind";
import { PlayerInfo } from "./PlayerInfo";
import { Language } from "@alice-localization/base/Language";
import { MapShareLocalization } from "@alice-localization/database/utils/aliceDb/MapShare/MapShareLocalization";

/**
 * Represents a shared beatmap.
 */
export class MapShare extends Manager implements DatabaseMapShare {
    beatmap_id: number;
    hash: string;
    submitter: string;
    id: Snowflake;
    date: number;
    summary: string;
    status: MapShareSubmissionStatus;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseMapShare = DatabaseManager.aliceDb?.collections.mapShare
            .defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.beatmap_id = data.beatmap_id;
        this.hash = data.hash;
        this.submitter = data.submitter;
        this.id = data.id;
        this.date = data.date;
        this.summary = data.summary;
        this.status = data.status;
    }

    /**
     * Accepts this submission.
     *
     * @returns An object containing the result of the operation.
     */
    accept(): Promise<OperationResult> {
        this.status = "accepted";

        return DatabaseManager.aliceDb.collections.mapShare.updateOne(
            { beatmap_id: this.beatmap_id },
            {
                $set: {
                    status: this.status,
                },
            }
        );
    }

    /**
     * Denies this submission.
     *
     * @returns An object containing the result of the operation.
     */
    deny(): Promise<OperationResult> {
        this.status = "denied";

        return DatabaseManager.aliceDb.collections.mapShare.updateOne(
            { beatmap_id: this.beatmap_id },
            {
                $set: {
                    status: this.status,
                },
            }
        );
    }

    /**
     * Deletes this submission.
     *
     * This is done if a beatmap is updated after it is submitted.
     *
     * @returns An object containing the result of the operation.
     */
    delete(): Promise<OperationResult> {
        return DatabaseManager.aliceDb.collections.mapShare.deleteOne({
            beatmap_id: this.beatmap_id,
        });
    }

    /**
     * Posts this submission in the map share channel.
     *
     * @param language The locale of the user who attempted to post this submission. Defaults to English.
     * @returns An object containing the result of the operation.
     */
    async post(language: Language = "en"): Promise<OperationResult> {
        const localization: MapShareLocalization =
            this.getLocalization(language);

        if (this.status !== "accepted") {
            return this.createOperationResult(
                false,
                localization.getTranslation("submissionNotAccepted")
            );
        }

        const embedOptions: MessageOptions | null =
            await EmbedCreator.createMapShareEmbed(this);

        if (!embedOptions) {
            return this.createOperationResult(
                false,
                localization.getTranslation("beatmapNotFound")
            );
        }

        const coinAward: number =
            200 * Math.floor(this.summary.split(" ").length / 50);

        const playerInfo: PlayerInfo | null =
            await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
                this.id,
                {
                    projection: {
                        _id: 0,
                        alicecoins: 1,
                    },
                }
            );

        if (playerInfo) {
            await playerInfo.incrementCoins(coinAward, language);
        } else {
            const bindInfo: UserBind | null =
                await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                    this.id,
                    { projection: { _id: 0, uid: 1, username: 1 } }
                );

            if (!bindInfo) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("submitterNotBinded")
                );
            }

            await DatabaseManager.aliceDb.collections.playerInfo.insert({
                uid: bindInfo.uid,
                username: bindInfo.username,
                discordid: this.id,
                alicecoins: coinAward,
            });
        }

        const channel: TextChannel = <TextChannel>(
            await (
                await this.client.guilds.fetch(Constants.mainServer)
            ).channels.fetch("430002296160649229")
        );

        await channel.send(embedOptions);

        this.status = "posted";

        return DatabaseManager.aliceDb.collections.mapShare.updateOne(
            { beatmap_id: this.beatmap_id },
            {
                $set: {
                    status: this.status,
                },
            }
        );
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): MapShareLocalization {
        return new MapShareLocalization(language);
    }
}
