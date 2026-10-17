import { PPCalculationMethod } from "@enums/utils/PPCalculationMethod";
import { Modes, RequestResponse } from "@rian8337/osu-base";
import { consola } from "consola";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PPProcessorRESTManager } from "./PPProcessorRESTManager";
import { RESTManager } from "./RESTManager";

function response(statusCode: number, body: unknown): RequestResponse {
    return {
        statusCode,
        data: Buffer.from(JSON.stringify(body)),
    } as RequestResponse;
}

describe("PPProcessorRESTManager", () => {
    let request: ReturnType<typeof vi.spyOn<typeof RESTManager, "request">>;

    beforeEach(() => {
        process.env.DPP_BROKER_URL = "http://broker.test";
        process.env.DPP_BROKER_KEY = "broker-key";

        request = vi.spyOn(RESTManager, "request");
        vi.spyOn(consola, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("maps live and rebalance to the default variants", async () => {
        request.mockResolvedValue(response(404, { error: "not found" }));

        await PPProcessorRESTManager.getPerformanceAttributes(
            1,
            Modes.Droid,
            PPCalculationMethod.rebalance,
        );

        const url = request.mock.calls[0][0].toString();

        expect(url).toMatch(/\/variants\/droid-rebalance\/performance$/);
    });

    it("sends X-Acting-Uid only when acting for a person", async () => {
        request.mockResolvedValue(response(200, []));

        await PPProcessorRESTManager.getVariants(42);
        await PPProcessorRESTManager.getVariants();

        const [acting, anonymous] = request.mock.calls.map(
            ([url, options]) => ({
                url: url.toString(),
                headers: options?.headers as Record<string, string>,
            }),
        );

        expect(acting.url).toBe("http://broker.test/variants");
        expect(acting.headers["X-Api-Key"]).toBe("broker-key");
        expect(acting.headers["X-Acting-Uid"]).toBe("42");
        expect(anonymous.headers).not.toHaveProperty("X-Acting-Uid");
    });

    it("returns null when the broker refuses a variant", async () => {
        request.mockResolvedValue(response(404, { error: "unknown variant" }));

        const result =
            await PPProcessorRESTManager.getPerformanceAttributesForVariant(
                1,
                "missing-variant",
            );

        expect(result).toBeNull();
    });
});
