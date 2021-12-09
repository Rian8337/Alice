import request from "request";
import { Utils } from "./Utils";

export interface RequestResponse {
    /**
     * The result of the API request.
     */
    readonly data: Buffer;

    /**
     * The status code of the API request.
     */
    readonly statusCode: number;
}

type DroidAPIEndpoint =
    | "banscore.php"
    | "getuserinfo.php"
    | "scoresearch.php"
    | "scoresearchv2.php"
    | "rename.php"
    | "upload"
    | "user_list.php"
    | "usergeneral.php"
    | "top.php"
    | "time.php";
type OsuAPIEndpoint =
    | "get_beatmaps"
    | "get_user"
    | "get_scores"
    | "get_user_best"
    | "get_user_recent"
    | "get_match"
    | "get_replay";

abstract class APIRequestBuilder {
    /**
     * The main point of API host.
     */
    protected abstract readonly host: string;

    /**
     * The API key for this builder.
     */
    protected abstract readonly APIkey: string;

    /**
     * The parameter for API key requests.
     */
    protected abstract readonly APIkeyParam: string;

    /**
     * Whether or not to include the API key in the request URL.
     */
    protected requiresAPIkey: boolean = true;

    /**
     * The endpoint of this builder.
     */
    protected endpoint: string = "";

    /**
     * The parameters of this builder.
     */
    protected readonly params: Map<string, string | number> = new Map();

    private fetchAttempts: number = 0;

    /**
     * Sets the API endpoint.
     *
     * @param endpoint The endpoint to set.
     */
    abstract setEndpoint(endpoint: DroidAPIEndpoint | OsuAPIEndpoint): this;

    /**
     * Sets if this builder includes the API key in the request URL.
     *
     * @param requireAPIkey Whether or not to include the API key in the request URL.
     */
    setRequireAPIkey(requireAPIkey: boolean): this {
        this.requiresAPIkey = requireAPIkey;
        return this;
    }

    /**
     * Builds the URL to request the API.
     */
    buildURL(): string {
        let url: string = this.host + this.endpoint;

        if (
            this instanceof DroidAPIRequestBuilder &&
            this.endpoint === "upload"
        ) {
            url += "/";
            for (const [, value] of this.params.entries()) {
                url += value;
            }
            return url;
        }

        url += "?";

        if (this.requiresAPIkey) {
            if (!this.APIkey) {
                throw new Error(
                    "An API key is not specified as environment variable"
                );
            }
            url += this.APIkeyParam;
        }

        for (const [param, value] of this.params.entries()) {
            url += `${param}=${encodeURIComponent(value)}&`;
        }
        return url;
    }

    /**
     * Sends a request to the API using built parameters.
     *
     * If the request fails, it will be redone 5 times.
     */
    sendRequest(): Promise<RequestResponse> {
        return new Promise((resolve) => {
            const url: string = this.buildURL();
            const dataArray: Buffer[] = [];

            request(url)
                .on("data", (chunk) => {
                    dataArray.push(Buffer.from(chunk));
                })
                .on("complete", async (response) => {
                    ++this.fetchAttempts;

                    if (response.statusCode !== 200 && this.fetchAttempts < 5) {
                        await Utils.sleep(0.2);

                        return resolve(this.sendRequest());
                    }

                    return resolve({
                        data: Buffer.concat(dataArray),
                        statusCode: response.statusCode,
                    });
                })
                .on("error", (e) => {
                    throw e;
                });
        });
    }

    /**
     * Adds a parameter to the builder.
     *
     * @param param The parameter to add.
     * @param value The value to add for the parameter.
     */
    addParameter(param: string, value: string | number): this {
        this.params.set(param, value);
        return this;
    }

    /**
     * Removes a parameter from the builder.
     *
     * @param param The parameter to remove.
     */
    removeParameter(param: string): this {
        if (this.params.get(param)) {
            this.params.delete(param);
        }
        return this;
    }
}

/**
 * API request builder for osu!droid.
 */
export class DroidAPIRequestBuilder extends APIRequestBuilder {
    protected override readonly host: string = "http://ops.dgsrz.com/api/";
    protected override readonly APIkey: string = process.env
        .DROID_API_KEY as string;
    protected override readonly APIkeyParam: string = `apiKey=${this.APIkey}&`;

    override setEndpoint(endpoint: DroidAPIEndpoint): this {
        this.endpoint = endpoint;
        return this;
    }
}

/**
 * API request builder for osu!standard.
 */
export class OsuAPIRequestBuilder extends APIRequestBuilder {
    protected override readonly host: string = "https://osu.ppy.sh/api/";
    protected override readonly APIkey: string = process.env
        .OSU_API_KEY as string;
    protected override readonly APIkeyParam: string = `k=${this.APIkey}&`;

    override setEndpoint(endpoint: OsuAPIEndpoint): this {
        this.endpoint = endpoint;
        return this;
    }
}
