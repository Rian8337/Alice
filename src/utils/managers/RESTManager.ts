import request, { CoreOptions } from "request";
import { RequestResponse } from "@rian8337/osu-base";
import { Manager } from "@alice-utils/base/Manager";
import { Image, loadImage } from "canvas";
import { Snowflake } from "discord.js";
import { TatsuAPIGuildMemberRanking } from "@alice-interfaces/utils/TatsuAPIGuildMemberRanking";

export abstract class RESTManager extends Manager {
    /**
     * Sends a request to the specified URL.
     *
     * @param url The URL.
     * @param options The options of the request.
     * @returns The result of the request.
     */
    static request(
        url: string | URL,
        options?: CoreOptions
    ): Promise<RequestResponse> {
        return new Promise((resolve) => {
            const dataArray: Buffer[] = [];

            request(url.toString(), options)
                .on("data", (chunk) => dataArray.push(Buffer.from(chunk)))
                .on("complete", (req) => {
                    resolve({
                        statusCode: req.statusCode,
                        data: Buffer.concat(dataArray),
                    });
                });
        });
    }

    /**
     * Downloads an image.
     *
     * @param url The image to download.
     * @returns The downloaded image, `null` if the image is not downloaded.
     */
    static async downloadImage(url: string | URL): Promise<Image | null> {
        const result: RequestResponse = await this.request(url);

        if (result.statusCode !== 200) {
            return null;
        }

        try {
            return loadImage(result.data);
        } catch {
            return null;
        }
    }

    /**
     * Gets a user's Tatsu XP in a guild.
     *
     * @param guildId The ID of the guild.
     * @param userId The ID of the user.
     * @returns The user's Tatsu XP, `null` if the request fails (non-`2xx` status code).
     */
    static async getUserTatsuXP(
        guildId: Snowflake,
        userId: Snowflake
    ): Promise<number | null> {
        const result: RequestResponse = await this.request(
            `https://api.tatsu.gg/v1/guilds/${guildId}/rankings/members/${userId}/all`,
            {
                headers: {
                    Authorization: process.env.TATSU_API_KEY,
                },
            }
        );

        if (result.statusCode !== 200) {
            return null;
        }

        const data: TatsuAPIGuildMemberRanking = JSON.parse(
            result.data.toString("utf-8")
        );

        return data.score;
    }
}
