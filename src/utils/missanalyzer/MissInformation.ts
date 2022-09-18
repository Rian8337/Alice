import {
    BeatmapMetadata,
    HitObject,
    modes,
    Playfield,
    Slider,
    SliderRepeat,
    SliderTick,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import { hitResult } from "@rian8337/osu-droid-replay-analyzer";
import { Canvas } from "canvas";

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
     * The rate at which the clock progress in the score.
     */
    readonly clockRate: number;

    /**
     * Whether to flip objects vertically before drawing them.
     */
    readonly drawFlipped: boolean;

    /**
     * The verdict for the miss.
     */
    readonly verdict?: string;

    /**
     * The cursor position at the closest hit to the object.
     */
    readonly cursorPosition?: Vector2;

    /**
     * The closest hit to the object.
     */
    readonly closestHit?: number;

    /**
     * The objects prior to the current object.
     */
    readonly previousObjects: HitObject[];

    /**
     * The hit results of past objects.
     */
    readonly previousHitResults: hitResult[];

    private canvas?: Canvas;
    private readonly playfieldScale: number = 0.75;

    /**
     * @param metadata The metadata of the beatmap.
     * @param object The object that was missed.
     * @param objectIndex The index of the object.
     * @param missIndex The index of the miss in the score.
     * @param totalMisses The amount of misses in the score.
     * @param verdict The verdict for the miss.
     * @param clockRate The rate at which the clock progress in the score.
     * @param drawFlipped Whether to flip objects vertically before drawing them.
     * @param previousObjects The objects prior to the current object.
     * @param previousHitResults The hit results of past objects.
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
        clockRate: number,
        drawFlipped: boolean,
        previousObjects: HitObject[],
        previousHitResults: hitResult[],
        verdict?: string,
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
        this.clockRate = clockRate;
        this.drawFlipped = drawFlipped;
        this.cursorPosition = cursorPosition;
        this.closestHit = closestHit;
        this.previousObjects = previousObjects;
        this.previousHitResults = previousHitResults;

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

        this.canvas = new Canvas(600, 500);

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");
        const textPadding: number = 5;

        context.save();
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();

        context.font = "16px Exo";
        context.textBaseline = "middle";
        context.fillText(
            `${this.metadata.artist} - ${this.metadata.title} [${this.metadata.version}]`,
            textPadding,
            textPadding + 10
        );
        context.fillText(
            `Object ${this.objectIndex + 1} of ${this.totalObjects}`,
            5,
            textPadding + 28
        );
        context.fillText(
            `Miss ${this.missIndex + 1} of ${this.totalMisses}`,
            5,
            textPadding + 46
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
            485 - textPadding
        );

        if (this.verdict) {
            const verdictText: string = `Verdict: ${this.verdict}`;
            context.fillText(
                verdictText,
                this.canvas.width -
                    textPadding -
                    context.measureText(verdictText).width,
                (this.closestHit !== undefined ? 465 : 485) - textPadding
            );
        }

        if (this.closestHit !== undefined) {
            let closestHitText: string = `Closest tap: ${
                Number.isInteger(this.closestHit)
                    ? Math.abs(this.closestHit)
                    : Math.abs(this.closestHit).toFixed(2)
            }ms${
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
                    closestHitText += `, ${
                        Number.isInteger(distanceToObject)
                            ? distanceToObject
                            : distanceToObject.toFixed(2)
                    } units off`;
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
        const scaledPlayfieldX: number =
            Playfield.baseSize.x * this.playfieldScale;
        const scaledPlayfieldY: number =
            Playfield.baseSize.y * this.playfieldScale;

        context.save();
        context.translate(
            // Center the playfield vertically.
            (this.canvas.width - scaledPlayfieldX) / 2,
            115
        );
        context.lineWidth = 3;
        context.strokeRect(0, 0, scaledPlayfieldX, scaledPlayfieldY);
        context.lineWidth = 1;

        for (let i = 0; i < this.previousObjects.length; ++i) {
            this.drawObject(
                this.previousObjects[i],
                this.previousHitResults[i],
                i + 1
            );
        }
        this.drawObject(
            this.object,
            hitResult.RESULT_0,
            this.previousObjects.length + 1
        );

        if (this.cursorPosition) {
            // Draw the cursor position.
            const drawPosition: Vector2 = this.flipVectorVertically(
                this.cursorPosition.scale(this.playfieldScale)
            );

            const gradient: CanvasGradient = context.createRadialGradient(
                drawPosition.x,
                drawPosition.y,
                0,
                drawPosition.x,
                drawPosition.y,
                10
            );

            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(1, "#9e3fe8");

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(drawPosition.x, drawPosition.y, 10, 0, 2 * Math.PI);
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
     * @param objectHitResult The hit result of the object. This will determine the color of the object.
     * @param objectIndex The index of the object.
     */
    private drawObject(
        object: HitObject,
        objectHitResult: hitResult,
        objectIndex: number
    ): void {
        if (!this.canvas) {
            return;
        }

        // Only draw if the object is not a spinner.
        if (object instanceof Spinner) {
            return;
        }

        // Determine colors from hit result.
        let fillColor: string;
        let borderColor: string;
        let sliderPathColor: string;

        switch (objectHitResult) {
            case hitResult.RESULT_300:
                fillColor = "#326ed9";
                borderColor = "#2b59ab";
                sliderPathColor = "#467ee0";
                break;
            case hitResult.RESULT_100:
                fillColor = "#40bd48";
                borderColor = "#38a83f";
                sliderPathColor = "#4deb57";
                break;
            case hitResult.RESULT_50:
                fillColor = "#c9913c";
                borderColor = "#c98318";
                sliderPathColor = "#de9f40";
                break;
            case hitResult.RESULT_0:
                fillColor = "#e63c3c";
                borderColor = "#bf2121";
                sliderPathColor = "#eb4d4d";
                break;
        }

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");

        const objectDrawPosition: Vector2 = this.flipVectorVertically(
            object.getStackedPosition(modes.droid).scale(this.playfieldScale)
        );
        const scaledRadius: number =
            object.getRadius(modes.droid) * this.playfieldScale;

        if (object instanceof Slider) {
            // Draw the path first, then we can apply the slider head.
            const drawnDistance: number =
                object.path.expectedDistance * this.playfieldScale;

            for (let i = 0; i <= drawnDistance; i += 5) {
                const pathPosition: Vector2 = object
                    .getStackedPosition(modes.droid)
                    .add(object.path.positionAt(i / drawnDistance));
                const drawPosition: Vector2 = this.flipVectorVertically(
                    pathPosition.scale(this.playfieldScale)
                );

                // Path circle
                context.fillStyle = sliderPathColor;
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
            }

            // Only draw path direction if the path is long enough.
            if (object.path.expectedDistance > 200) {
                context.fillStyle = "#606060";

                for (let i = 0; i <= drawnDistance; i += 5) {
                    const pathPosition: Vector2 = object
                        .getStackedPosition(modes.droid)
                        .add(object.path.positionAt(i / drawnDistance));
                    const drawPosition: Vector2 = this.flipVectorVertically(
                        pathPosition.scale(this.playfieldScale)
                    );

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
                // Only draw for one span.
                if (nestedObject instanceof SliderRepeat) {
                    break;
                }

                if (!(nestedObject instanceof SliderTick)) {
                    continue;
                }

                const drawPosition: Vector2 = this.flipVectorVertically(
                    nestedObject
                        .getStackedPosition(modes.droid)
                        .scale(this.playfieldScale)
                );

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

        // Draw the border first, then fill with the circle color.
        context.fillStyle = borderColor;
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

        context.fillStyle = fillColor;
        context.beginPath();
        context.arc(
            objectDrawPosition.x,
            objectDrawPosition.y,
            scaledRadius * 0.9,
            0,
            2 * Math.PI
        );
        context.fill();
        context.closePath();

        // Finally, draw the index of the object.
        context.fillStyle = "#000000";
        context.font = `bold ${Math.ceil(scaledRadius)}px Exo`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
            objectIndex.toString(),
            objectDrawPosition.x,
            objectDrawPosition.y
        );
    }

    /**
     * Flips a vector vertically with respect to the osu! playfield size.
     *
     * @param vec The vector to flip.
     * @returns The flipped vector.
     */
    private flipVectorVertically(vec: Vector2): Vector2 {
        return this.drawFlipped
            ? new Vector2(
                  vec.x,
                  Playfield.baseSize.y * this.playfieldScale - vec.y
              )
            : vec;
    }
}
