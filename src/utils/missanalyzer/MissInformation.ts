import {
    BeatmapMetadata,
    HitObject,
    Interpolation,
    modes,
    Playfield,
    Slider,
    SliderRepeat,
    SliderTick,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import {
    CursorOccurrence,
    CursorOccurrenceGroup,
    HitResult,
    MovementType,
} from "@rian8337/osu-droid-replay-analyzer";
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
    readonly closestCursorPosition?: Vector2;

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
    readonly previousHitResults: HitResult[];

    /**
     * The AR of the beatmap, in milliseconds.
     */
    readonly approachRateTime: number;

    /**
     * The cursor groups to draw for each cursor instance.
     */
    readonly cursorGroups: CursorOccurrenceGroup[][];

    private canvas?: Canvas;
    private readonly playfieldScale: number = 1.75;

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
     * @param cursorGroups The cursor groups to draw.
     * @param approachRateTime The AR of the beatmap, in milliseconds.
     * @param closestCursorPosition The cursor position at the closest hit to the object.
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
        previousHitResults: HitResult[],
        cursorGroups: CursorOccurrenceGroup[][],
        approachRateTime: number,
        verdict?: string,
        closestCursorPosition?: Vector2,
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
        this.closestCursorPosition = closestCursorPosition;
        this.closestHit = closestHit;
        this.previousObjects = previousObjects;
        this.previousHitResults = previousHitResults;
        this.cursorGroups = cursorGroups;
        this.approachRateTime = approachRateTime;

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

        this.canvas = new Canvas(1200, 1000);
        this.writeTexts();
        this.initPlayfield();
        this.drawObjects();
        this.drawCursorGroups();
        this.drawClosestCursorPosition();

        this.canvas.getContext("2d").restore();

        return this.canvas;
    }

    /**
     * Writes necessary texts in the canvas.
     */
    private writeTexts(): void {
        if (!this.canvas) {
            return;
        }

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");
        const textPadding: number = 5;

        context.save();
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();

        context.font = "28px Exo";
        context.textBaseline = "middle";
        context.fillText(
            `${this.metadata.artist} - ${this.metadata.title} [${this.metadata.version}]`,
            textPadding,
            textPadding + 10
        );
        context.fillText(
            `Object ${this.objectIndex + 1} of ${this.totalObjects}`,
            5,
            textPadding + 40
        );
        context.fillText(
            `Miss ${this.missIndex + 1} of ${this.totalMisses}`,
            5,
            textPadding + 70
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
            985 - textPadding
        );

        if (this.verdict) {
            const verdictText: string = `Verdict: ${this.verdict}`;
            context.fillText(
                verdictText,
                this.canvas.width -
                    textPadding -
                    context.measureText(verdictText).width,
                (this.closestHit !== undefined ? 955 : 985) - textPadding
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

            if (this.closestCursorPosition) {
                const distanceToObject: number =
                    this.closestCursorPosition.getDistance(
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
                985 - textPadding
            );
        }

        context.restore();
    }

    /**
     * Initializes the playfield and translates the context
     * into the (0, 0) coordinate of the playfield.
     */
    private initPlayfield(): void {
        if (!this.canvas) {
            return;
        }

        // The playfield is 512x384. However, since we're drawing on a limited space,
        // we will have to scale the area and objects down.
        const scaledPlayfieldX: number =
            Playfield.baseSize.x * this.playfieldScale;
        const scaledPlayfieldY: number =
            Playfield.baseSize.y * this.playfieldScale;

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");
        context.save();
        context.translate(
            // Center the playfield.
            (this.canvas.width - scaledPlayfieldX) / 2,
            (this.canvas.height - scaledPlayfieldY) / 2
        );
        context.lineWidth = 3;
        context.strokeRect(0, 0, scaledPlayfieldX, scaledPlayfieldY);
        context.lineWidth = 1;
    }

    /**
     * Draws all objects to the canvas.
     */
    private drawObjects(): void {
        for (let i = 0; i < this.previousObjects.length; ++i) {
            this.drawObject(
                this.previousObjects[i],
                this.previousHitResults[i],
                i + 1
            );
        }

        this.drawObject(
            this.object,
            HitResult.miss,
            this.previousObjects.length + 1
        );
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
        objectHitResult: HitResult,
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
            case HitResult.great:
                fillColor = "#326ed9";
                borderColor = "#2b59ab";
                sliderPathColor = "#467ee0";
                break;
            case HitResult.good:
                fillColor = "#40bd48";
                borderColor = "#38a83f";
                sliderPathColor = "#4deb57";
                break;
            case HitResult.meh:
                fillColor = "#c9913c";
                borderColor = "#c98318";
                sliderPathColor = "#de9f40";
                break;
            case HitResult.miss:
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

            context.fillStyle = sliderPathColor;
            context.globalAlpha = 0.8;
            context.beginPath();

            for (let i = 0; i <= drawnDistance; i += 5) {
                const pathPosition: Vector2 = object
                    .getStackedPosition(modes.droid)
                    .add(object.path.positionAt(i / drawnDistance));
                const drawPosition: Vector2 = this.flipVectorVertically(
                    pathPosition.scale(this.playfieldScale)
                );

                context.arc(
                    drawPosition.x,
                    drawPosition.y,
                    scaledRadius,
                    0,
                    2 * Math.PI
                );
            }

            context.fill();
            context.closePath();

            // Only draw path direction if the path is long enough.
            if (object.path.expectedDistance > 150) {
                context.strokeStyle = "#606060";
                context.globalAlpha = 0.5;
                context.lineWidth = scaledRadius * 0.15;
                context.lineCap = "round";
                context.beginPath();

                for (let i = 0; i <= drawnDistance; i += 5) {
                    const pathPosition: Vector2 = object
                        .getStackedPosition(modes.droid)
                        .add(object.path.positionAt(i / drawnDistance));
                    const drawPosition: Vector2 = this.flipVectorVertically(
                        pathPosition.scale(this.playfieldScale)
                    );

                    context.lineTo(drawPosition.x, drawPosition.y);
                }

                context.stroke();
                context.closePath();
            }

            // Draw slider ticks.
            context.globalAlpha = 0.8;
            context.fillStyle = "#ad6140";

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
        context.globalAlpha = 0.9;
        context.beginPath();
        context.arc(
            objectDrawPosition.x,
            objectDrawPosition.y,
            scaledRadius,
            0,
            2 * Math.PI
        );
        context.arc(
            objectDrawPosition.x,
            objectDrawPosition.y,
            scaledRadius * 0.9,
            0,
            2 * Math.PI
        );
        context.fill("evenodd");
        context.closePath();

        context.fillStyle = fillColor;
        context.globalAlpha = 0.85;
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
     * Draws cursor groups.
     */
    private drawCursorGroups(): void {
        if (
            !this.canvas ||
            this.cursorGroups.length === 0 ||
            this.object instanceof Spinner
        ) {
            return;
        }

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");

        const minTime: number = this.object.startTime - this.approachRateTime;
        const maxTime: number = this.object.endTime + 200;

        const color: string = "#800080";
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 2.5;
        context.lineCap = "round";
        context.globalAlpha = 1;

        for (let i = 0; i < this.cursorGroups.length; ++i) {
            const groups: CursorOccurrenceGroup[] = this.cursorGroups[i];

            for (let j = 0; j < groups.length; ++j) {
                const group: CursorOccurrenceGroup = groups[j];

                const { allOccurrences } = group;

                for (let k = 0; k < allOccurrences.length; ++k) {
                    const occurrence: CursorOccurrence = allOccurrences[k];

                    if (occurrence.time < minTime) {
                        continue;
                    }

                    if (
                        occurrence.time > maxTime ||
                        occurrence.id === MovementType.up
                    ) {
                        break;
                    }

                    context.beginPath();

                    const drawPosition: Vector2 = this.flipVectorVertically(
                        occurrence.position.scale(this.playfieldScale)
                    );

                    if (occurrence.id === MovementType.down) {
                        context.moveTo(drawPosition.x, drawPosition.y);
                        context.arc(
                            drawPosition.x,
                            drawPosition.y,
                            5,
                            0,
                            2 * Math.PI
                        );
                        context.fill();
                    } else {
                        const prevOccurrence: CursorOccurrence =
                            allOccurrences[k - 1];
                        const previousDrawPosition: Vector2 =
                            this.flipVectorVertically(
                                prevOccurrence.position.scale(
                                    this.playfieldScale
                                )
                            );

                        context.moveTo(
                            previousDrawPosition.x,
                            previousDrawPosition.y
                        );
                        context.lineTo(drawPosition.x, drawPosition.y);
                        context.stroke();

                        // Check for presses between both occurrences.
                        for (let l = 0; l < this.cursorGroups.length; ++l) {
                            // Do not check the current cursor instance in loop.
                            if (l === i) {
                                continue;
                            }

                            for (const cursorGroup of this.cursorGroups[l]) {
                                const cursorDownTime: number =
                                    cursorGroup.down.time;

                                if (cursorDownTime < prevOccurrence.time) {
                                    continue;
                                }

                                if (cursorDownTime > occurrence.time) {
                                    break;
                                }

                                const t: number =
                                    (cursorDownTime - prevOccurrence.time) /
                                    (occurrence.time - prevOccurrence.time);

                                const cursorPosition: Vector2 = new Vector2(
                                    Interpolation.lerp(
                                        prevOccurrence.position.x,
                                        occurrence.position.x,
                                        t
                                    ),
                                    Interpolation.lerp(
                                        prevOccurrence.position.y,
                                        occurrence.position.y,
                                        t
                                    )
                                );

                                const cursorDrawPosition: Vector2 =
                                    this.flipVectorVertically(
                                        cursorPosition.scale(
                                            this.playfieldScale
                                        )
                                    );

                                context.beginPath();
                                context.lineWidth = 2;
                                context.arc(
                                    cursorDrawPosition.x,
                                    cursorDrawPosition.y,
                                    5,
                                    0,
                                    2 * Math.PI
                                );
                                context.stroke();
                                context.closePath();
                                context.lineWidth = 2.5;
                            }
                        }
                    }

                    context.closePath();
                }
            }
        }
    }

    /**
     * Draws the closest cursor position to the object.
     */
    private drawClosestCursorPosition(): void {
        if (!this.canvas || !this.closestCursorPosition) {
            return;
        }

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");

        const drawPosition: Vector2 = this.flipVectorVertically(
            this.closestCursorPosition.scale(this.playfieldScale)
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
        context.globalAlpha = 1;
        context.beginPath();
        context.arc(drawPosition.x, drawPosition.y, 10, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
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
