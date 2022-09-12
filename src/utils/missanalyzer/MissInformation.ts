import {
    BeatmapMetadata,
    HitObject,
    modes,
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
     * The rate at which the clock progress in the score.
     */
    readonly clockRate: number;

    /**
     * The cursor position at the closest hit to the object.
     */
    readonly cursorPosition?: Vector2;

    /**
     * The closest hit to the object.
     */
    readonly closestHit?: number;

    /**
     * The object prior to the current object.
     */
    readonly previousObject?: HitObject;

    private canvas?: Canvas;
    private readonly scale: number = 0.75;

    /**
     * @param metadata The metadata of the beatmap.
     * @param object The objec that was mised.
     * @param objectIndex The index of the object.
     * @param missIndex The index of the miss in the score.
     * @param totalMisses The amount of misses in the score.
     * @param verdict The verdict for the miss.
     * @param clockRate The rate at which the clock progress in the score.
     * @param cursorPosition The cursor position at the closest hit to the object.
     * @param closestHit The closest hit to the object.
     * @param previousObject The object prior to the current object.
     */
    constructor(
        metadata: BeatmapMetadata,
        object: HitObject,
        objectIndex: number,
        totalObjects: number,
        missIndex: number,
        totalMisses: number,
        verdict: string,
        clockRate: number,
        cursorPosition?: Vector2,
        closestHit?: number,
        previousObject?: HitObject
    ) {
        this.metadata = metadata;
        this.object = object;
        this.objectIndex = objectIndex;
        this.totalObjects = totalObjects;
        this.missIndex = missIndex;
        this.totalMisses = totalMisses;
        this.verdict = verdict;
        this.clockRate = clockRate;
        this.cursorPosition = cursorPosition;
        this.closestHit = closestHit;
        this.previousObject = previousObject;

        if (this.closestHit) {
            this.closestHit /= clockRate;
        }
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
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();

        context.font = "18px Exo";
        context.textBaseline = "middle";
        context.fillText(
            `${this.metadata.artist} - ${this.metadata.title} [${this.metadata.version}]`,
            textPadding,
            textPadding + 10
        );
        context.fillText(
            `Object ${this.objectIndex + 1} of ${this.totalObjects}`,
            5,
            textPadding + 30
        );
        context.fillText(
            `Miss ${this.missIndex + 1} of ${this.totalMisses}`,
            5,
            textPadding + 50
        );

        let startTime: number = Math.floor(
            this.object.startTime / this.clockRate
        );

        const minutes: number = Math.floor(startTime / 60000);
        startTime -= minutes * 60000;

        const seconds: number = Math.floor(startTime / 1000);
        startTime -= seconds * 1000;

        context.fillText(
            `Time: ${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}.${startTime.toString().padStart(3, "0")}`,
            textPadding,
            465 - textPadding
        );

        const verdictText: string = `Verdict: ${this.verdict}`;
        context.fillText(
            verdictText,
            this.canvas.width -
                textPadding -
                context.measureText(verdictText).width,
            (this.closestHit !== undefined ? 465 : 485) - textPadding
        );

        if (this.closestHit !== undefined) {
            let closestHitText: string = `Closest tap: ${Math.abs(
                this.closestHit
            ).toFixed(2)}ms${
                this.closestHit > 0
                    ? " late"
                    : this.closestHit < 0
                    ? " early"
                    : ""
            }`;

            if (this.cursorPosition) {
                const distanceToObject: number =
                    this.cursorPosition.getDistance(
                        this.object.getStackedPosition(modes.droid)
                    ) - this.object.getRadius(modes.droid);

                if (distanceToObject > 0) {
                    closestHitText += `, ${distanceToObject.toFixed(
                        2
                    )} units off`;
                }
            }

            context.fillText(
                closestHitText,
                this.canvas.width -
                    textPadding -
                    context.measureText(closestHitText).width,
                485 - textPadding
            );
        }

        context.restore();

        // The playfield is 512x384. However, since we're drawing on a limited space,
        // we will have to scale the area and objects down.
        const scaledPlayfieldX: number = 512 * this.scale;
        const scaledPlayfieldY: number = 384 * this.scale;

        context.save();
        context.translate(
            // Center the playfield vertically.
            (this.canvas.width - scaledPlayfieldX) / 2,
            115
        );
        context.strokeRect(0, 0, scaledPlayfieldX, scaledPlayfieldY);

        if (this.previousObject) {
            this.drawObject(this.previousObject, "#606060");
        }
        this.drawObject(this.object, "#85501e");

        if (this.cursorPosition) {
            // Draw the cursor position.
            const drawPosition: Vector2 = this.cursorPosition.scale(this.scale);

            context.fillStyle = "#5676f5";
            context.beginPath();
            context.arc(drawPosition.x, drawPosition.y, 10, 0, 2 * Math.PI);
            context.fill();
            context.closePath();

            // Make the middle part lighter.
            context.globalCompositeOperation = "lighter";
            context.fillStyle = "#ffffff";
            context.beginPath();
            context.arc(drawPosition.x, drawPosition.y, 5, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
        }

        context.restore();

        return this.canvas;
    }

    /**
     * Draws an object to the canvas.
     *
     * @param object The object to draw.
     * @param color The color to draw the object with.
     */
    private drawObject(object: HitObject, color: string): void {
        if (!this.canvas) {
            return;
        }

        // Only draw if the object is not a spinner.
        if (object instanceof Spinner) {
            return;
        }

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");

        const objectDrawPosition: Vector2 = object
            .getStackedPosition(modes.droid)
            .scale(this.scale);
        const scaledRadius: number = object.getRadius(modes.droid) * this.scale;

        if (object instanceof Slider) {
            // Draw the path first, then we can apply the slider head.
            const drawnDistance: number =
                object.path.expectedDistance * this.scale;

            for (let i = 0; i <= drawnDistance; i += 5) {
                const pathPosition: Vector2 = object
                    .getStackedPosition(modes.droid)
                    .add(object.path.positionAt(i / drawnDistance));
                const drawPosition: Vector2 = pathPosition.scale(this.scale);

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
                if (object.path.expectedDistance > 300) {
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
            for (const nestedObject of object.nestedHitObjects) {
                // Only draw for one span index.
                if (nestedObject instanceof SliderRepeat) {
                    break;
                }

                if (!(nestedObject instanceof SliderTick)) {
                    continue;
                }

                const drawPosition: Vector2 = nestedObject
                    .getStackedPosition(modes.droid)
                    .scale(this.scale);

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
        context.fillStyle = color;
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
    }
}
