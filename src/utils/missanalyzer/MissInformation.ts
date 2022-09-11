import {
    BeatmapMetadata,
    HitObject,
    Slider,
    SliderRepeat,
    SliderTick,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import { Canvas, CanvasRenderingContext2D } from "canvas";

/**
 * Represents an information about a miss.
 */
export class MissInformation {
    /**
     * The metadata of the beatmap.
     */
    readonly metadata: BeatmapMetadata;

    /**
     * The object that was missed.
     */
    readonly object: HitObject;

    /**
     * The zero-based index of the miss in the score.
     */
    readonly missIndex: number;

    /**
     * The amount of misses in the beatmap.
     */
    readonly totalMisses: number;

    /**
     * The zero-based index of the object.
     */
    readonly objectIndex: number;

    /**
     * The amount of objects in the beatmap.
     */
    readonly totalObjects: number;

    /**
     * The verdict for the miss.
     */
    readonly verdict: string;

    /**
     * The cursor position at the closest hit to the object.
     */
    readonly cursorPosition?: Vector2;

    /**
     * The closest hit to the object.
     */
    readonly closestHit?: number;

    private canvas?: Canvas;

    /**
     * @param metadata The metadata of the beatmap.
     * @param object The objec that was mised.
     * @param objectIndex The index of the object.
     * @param missIndex The index of the miss in the score.
     * @param totalMisses The amount of misses in the score.
     * @param verdict The verdict for the miss.
     * @param cursorPosition The cursor position at the closest hit to the object.
     * @param closestHit The closest hit to the object.
     */
    constructor(
        metadata: BeatmapMetadata,
        object: HitObject,
        objectIndex: number,
        totalObjects: number,
        missIndex: number,
        totalMisses: number,
        verdict: string,
        cursorPosition?: Vector2,
        closestHit?: number
    ) {
        this.metadata = metadata;
        this.object = object;
        this.objectIndex = objectIndex;
        this.totalObjects = totalObjects;
        this.missIndex = missIndex;
        this.totalMisses = totalMisses;
        this.verdict = verdict;
        this.cursorPosition = cursorPosition;
        this.closestHit = closestHit;
    }

    /**
     * Draws the object that was missed.
     *
     * @returns The canvas used to draw the object.
     */
    draw(): Canvas {
        if (this.canvas) {
            return this.canvas;
        }

        this.canvas = new Canvas(500, 500);

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");
        const textPadding: number = 5;

        context.save();
        context.font = "18px Exo";
        context.fillText(
            `${this.metadata.artist} - ${this.metadata.title} [${this.metadata.version}]`,
            textPadding,
            textPadding
        );
        context.fillText(
            `Object ${this.objectIndex + 1} of ${this.totalObjects}`,
            5,
            textPadding + 20
        );
        context.fillText(
            `Miss ${this.missIndex + 1} of ${this.totalMisses}`,
            5,
            textPadding + 40
        );

        let startTime: number = this.object.startTime;

        const minutes: number = Math.floor(startTime / 60000);
        startTime -= minutes * 60000;

        const seconds: number = Math.floor(startTime / 1000);
        startTime -= seconds * 1000;

        context.fillText(
            `Time: ${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}.${startTime.toString().padStart(3, "0")}`,
            textPadding,
            480 - textPadding
        );

        const verdictText: string = `Verdict: ${this.verdict}`;
        context.fillText(
            verdictText,
            this.canvas.width -
                textPadding -
                context.measureText(verdictText).width,
            (this.closestHit !== undefined ? 460 : 480) - textPadding
        );

        if (this.closestHit !== undefined) {
            const closestHitText: string = `Closest click: ${Math.abs(
                this.closestHit
            ).toFixed(2)}ms${
                this.closestHit > 0
                    ? " late"
                    : this.closestHit < 0
                    ? " early"
                    : ""
            }`;

            context.fillText(
                closestHitText,
                this.canvas.width -
                    textPadding -
                    context.measureText(closestHitText).width,
                480 - textPadding
            );
        }

        context.restore();

        // Only draw the object if it's not a spinner.
        if (!(this.object instanceof Spinner)) {
            // The playfield is 512x384. However, since we're drawing on a limited space,
            // we will have to scale the area and objects down.
            const scale: number = 0.8;

            context.save();
            context.translate(50, 50);
            context.strokeRect(0, 0, 512 * scale, 384 * scale);

            const objectDrawPosition: Vector2 =
                this.object.stackedPosition.scale(scale);
            const scaledRadius: number = this.object.radius * scale;

            if (this.object instanceof Slider) {
                // Draw the path first, then we can apply the slider head.
                const drawnDistance: number =
                    this.object.path.expectedDistance * scale;

                for (let i = 0; i <= drawnDistance; i += 5) {
                    const pathPosition: Vector2 =
                        this.object.stackedPosition.add(
                            this.object.path.positionAt(i / drawnDistance)
                        );
                    const drawPosition: Vector2 = pathPosition.scale(scale);

                    // Path circle
                    context.fillStyle = "#808080";
                    context.beginPath();
                    context.arc(
                        drawPosition.x,
                        drawPosition.y,
                        scaledRadius,
                        0,
                        2 * Math.PI
                    );
                    context.fill();
                    context.closePath();

                    // Only draw path direction if the path is long enough.
                    if (this.object.path.expectedDistance > 300) {
                        context.fillStyle = "#707070";
                        context.beginPath();
                        context.arc(
                            drawPosition.x,
                            drawPosition.y,
                            // Make path direction 15% the size of the slider path circle.
                            scaledRadius * 0.15,
                            0,
                            2 * Math.PI
                        );
                        context.fill();
                        context.closePath();
                    }
                }

                // Draw slider ticks.
                for (const nestedObject of this.object.nestedHitObjects) {
                    // Only draw for one span index.
                    if (nestedObject instanceof SliderRepeat) {
                        break;
                    }

                    if (!(nestedObject instanceof SliderTick)) {
                        continue;
                    }

                    const drawPosition: Vector2 =
                        nestedObject.stackedPosition.scale(scale);

                    context.fillStyle = "#ad6140";
                    context.beginPath();
                    context.arc(
                        drawPosition.x,
                        drawPosition.y,
                        // Make slider ticks 25% the size of the slider path circle.
                        scaledRadius * 0.25,
                        0,
                        2 * Math.PI
                    );
                    context.fill();
                    context.closePath();
                }
            }

            // Draw the circle or slider head.
            context.fillStyle = "#85501e";
            context.beginPath();
            context.arc(
                objectDrawPosition.x,
                objectDrawPosition.y,
                scaledRadius,
                0,
                2 * Math.PI
            );
            context.fill();
            context.closePath();

            if (this.cursorPosition) {
                // Draw the cursor position.
                const drawPosition: Vector2 = this.cursorPosition.scale(scale);

                context.fillStyle = "#5676f5";
                context.beginPath();
                context.arc(drawPosition.x, drawPosition.y, 40, 0, 2 * Math.PI);
                context.fill();
                context.closePath();

                // Make the middle part lighter.
                context.globalCompositeOperation = "lighter";
                context.fillStyle = "#ffffff";
                context.beginPath();
                context.arc(drawPosition.x, drawPosition.y, 30, 0, 2 * Math.PI);
                context.fill();
                context.closePath();
            }

            context.restore();
        }

        return this.canvas;
    }
}
