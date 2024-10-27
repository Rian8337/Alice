import { Config } from "@core/Config";
import { RequestResponse } from "@rian8337/osu-base";
import { RESTManager } from "./RESTManager";

/**
 * A REST manager for the dedicated Discord backend.
 */
export abstract class DiscordBackendRESTManager extends RESTManager {
    private static readonly endpoint = Config.isDebug
        ? "https://droidpp.osudroid.moe/api/discord/"
        : "http://localhost:3004/api/discord/";

    /**
     * Updates the role connection metadata of a Discord user.
     *
     * @param userId The ID of the user.
     */
    static updateMetadata(userId: string): Promise<RequestResponse> {
        return this.request(`${this.endpoint}update-metadata`, {
            method: "POST",
            body: {
                userId: userId,
                key: process.env.DISCORD_OAUTH_BACKEND_INTERNAL_KEY,
            },
            headers: {
                "Content-Type": "application/json",
            },
            json: true,
        });
    }
}
