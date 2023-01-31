import {
    BeatmapMetadata,
    HitObject,
    Interpolation,
    Modes,
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
                        this.object.getStackedPosition(Modes.droid)
                    ) - this.object.getRadius(Modes.droid);

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
        context.translate(
            // Center the playfield.
            (this.canvas.width - scaledPlayfieldX) / 2,
            (this.canvas.height - scaledPlayfieldY) / 2
        );
        context.scale(this.playfieldScale, this.playfieldScale);
        context.lineWidth = 3;
        context.strokeRect(0, 0, Playfield.baseSize.x, Playfield.baseSize.y);
        context.lineWidth = 1;
        context.save();
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
                fillColor = "#5b88d9";
                borderColor = "#5473ab";
                sliderPathColor = "#779de0";
                break;
            case HitResult.good:
                fillColor = "#63ba68";
                borderColor = "#59a85e";
                sliderPathColor = "#81eb89";
                break;
            case HitResult.meh:
                fillColor = "#d9ad6a";
                borderColor = "#cc9d56";
                sliderPathColor = "#d9a75d";
                break;
            case HitResult.miss:
                fillColor = "#de6464";
                borderColor = "#cc5c5c";
                sliderPathColor = "#eb7c7c";
                break;
        }

        const context: CanvasRenderingContext2D = this.canvas.getContext("2d");

        const stackOffset: Vector2 = object.getStackOffset(Modes.droid);
        const startPosition: Vector2 = this.flipVectorVertically(
            object.position
        ).add(stackOffset);
        const radius: number = object.getRadius(Modes.droid);
        const circleBorder: number = radius / 8;
        const shadowBlur: number = radius / 16;

        if (object instanceof Slider) {
            // Draw the path first, then we can apply the slider head.
            context.shadowBlur = 0;
            context.strokeStyle = sliderPathColor;
            context.lineWidth = (radius - circleBorder) * 2;
            context.lineCap = "round";
            context.globalAlpha = 0.8;
            context.beginPath();

            for (let i = 0; i <= object.path.expectedDistance; i += 5) {
                const drawPosition: Vector2 = startPosition.add(
                    this.flipVectorVertically(
                        object.path.positionAt(i / object.path.expectedDistance)
                    )
                );

                context.lineTo(drawPosition.x, drawPosition.y);
            }

            context.stroke();

            // Only draw path direction if the path is long enough.
            if (object.path.expectedDistance > 150) {
                context.strokeStyle = "#606060";
                context.globalAlpha = 0.5;
                context.lineWidth = radius * 0.15;
                context.stroke();
            }

            // Draw slider border.
            context.globalCompositeOperation = "source-over";
            context.shadowBlur = 0;
            context.strokeStyle = "#606060";
            context.globalAlpha = 0.4;
            context.lineWidth = radius * 2;
            context.stroke();
            context.closePath();

            // Draw slider ticks.
            context.globalAlpha = 0.8;
            context.fillStyle = "#ad6140";
            context.lineWidth = radius / 32;

            for (const nestedObject of object.nestedHitObjects.slice(1)) {
                // Only draw for one span.
                if (nestedObject instanceof SliderRepeat) {
                    break;
                }

                if (!(nestedObject instanceof SliderTick)) {
                    continue;
                }

                const drawPosition: Vector2 = this.flipVectorVertically(
                    nestedObject.position
                ).add(stackOffset);

                context.beginPath();
                context.arc(
                    drawPosition.x,
                    drawPosition.y,
                    radius / 16,
                    0,
                    2 * Math.PI
                );
                context.fill();
                context.closePath();
            }
        }

        // Draw the circle first, then border.

        context.fillStyle = fillColor;
        context.globalAlpha = 0.9;
        context.beginPath();
        context.arc(
            startPosition.x,
            startPosition.y,
            radius - circleBorder / 2,
            0,
            2 * Math.PI
        );
        context.fill();

        context.strokeStyle = borderColor;
        context.shadowBlur = shadowBlur;
        context.lineWidth = circleBorder;
        context.stroke();
        context.closePath();

        // Finally, draw the index of the object.
        context.fillStyle = "#000000";
        context.font = `bold ${Math.ceil(radius / 1.25)}px Exo`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
            objectIndex.toString(),
            startPosition.x,
            startPosition.y
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

        const color: string = "#cc00cc";
        const arrowColor: string = "#990099";
        // Draw direction arrow every 50 pixels the cursor has travelled.
        const arrowDistanceRate: number = 50;

        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 2.5;
        context.lineCap = "round";
        context.globalAlpha = 1;

        for (let i = 0; i < this.cursorGroups.length; ++i) {
            for (const { allOccurrences } of this.cursorGroups[i]) {
                let travelDistance: number = 0;

                for (let j = 0; j < allOccurrences.length; ++j) {
                    const occurrence: CursorOccurrence = allOccurrences[j];

                    if (occurrence.time < minTime) {
                        continue;
                    }

                    if (
                        occurrence.time > maxTime ||
                        occurrence.id === MovementType.up
                    ) {
                        break;
                    }

                    const drawPosition: Vector2 = this.flipVectorVertically(
                        occurrence.position
                    );

                    if (occurrence.id === MovementType.down) {
                        context.beginPath();
                        context.moveTo(drawPosition.x, drawPosition.y);
                        context.arc(
                            drawPosition.x,
                            drawPosition.y,
                            5,
                            0,
                            2 * Math.PI
                        );
                        context.fill();
                        context.closePath();
                    } else {
                        const prevOccurrence: CursorOccurrence =
                            allOccurrences[j - 1];
                        const previousDrawPosition: Vector2 =
                            this.flipVectorVertically(prevOccurrence.position);

                        travelDistance += occurrence.position.getDistance(
                            prevOccurrence.position
                        );

                        context.beginPath();
                        context.moveTo(
                            previousDrawPosition.x,
                            previousDrawPosition.y
                        );
                        context.lineTo(drawPosition.x, drawPosition.y);
                        context.stroke();
                        context.closePath();

                        // Check for presses between both occurrences.
                        for (let k = 0; k < this.cursorGroups.length; ++k) {
                            // Do not check the current cursor instance in loop.
                            if (k === i) {
                                continue;
                            }

                            for (const cursorGroup of this.cursorGroups[k]) {
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
                                    this.flipVectorVertically(cursorPosition);

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

                        for (
                            let distance = arrowDistanceRate;
                            distance <= travelDistance;
                            distance += arrowDistanceRate
                        ) {
                            const displacement: Vector2 =
                                occurrence.position.subtract(
                                    prevOccurrence.position
                                );
                            const drawDisplacement: Vector2 =
                                drawPosition.subtract(previousDrawPosition);
                            const angle: number = Math.atan2(
                                drawDisplacement.y,
                                drawDisplacement.x
                            );

                            const prevDistanceTravelled: number =
                                travelDistance - displacement.length;

                            const t: number =
                                (distance - prevDistanceTravelled) /
                                (travelDistance - prevDistanceTravelled);
                            const cursorDrawPosition: Vector2 =
                                this.flipVectorVertically(
                                    new Vector2(
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
                                    )
                                );
                            const headLength: number = 10;

                            context.strokeStyle = arrowColor;
                            context.beginPath();
                            context.moveTo(
                                cursorDrawPosition.x,
                                cursorDrawPosition.y
                            );
                            context.lineTo(
                                cursorDrawPosition.x -
                                    headLength * Math.cos(angle - Math.PI / 6),
                                cursorDrawPosition.y -
                                    headLength * Math.sin(angle - Math.PI / 6)
                            );
                            context.moveTo(
                                cursorDrawPosition.x,
                                cursorDrawPosition.y
                            );
                            context.lineTo(
                                cursorDrawPosition.x -
                                    headLength * Math.cos(angle + Math.PI / 6),
                                cursorDrawPosition.y -
                                    headLength * Math.sin(angle + Math.PI / 6)
                            );
                            context.stroke();
                            context.closePath();
                            context.strokeStyle = color;
                        }

                        travelDistance %= arrowDistanceRate;
                    }
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
            this.closestCursorPosition
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
            ? new Vector2(vec.x, Playfield.baseSize.y - vec.y)
            : vec;
    }
}
