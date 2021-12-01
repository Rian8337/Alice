import request, { CoreOptions } from "request";
import { RequestResponse } from "osu-droid";
import { Manager } from "@alice-utils/base/Manager";
import { Image, loadImage } from "canvas";

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
}
