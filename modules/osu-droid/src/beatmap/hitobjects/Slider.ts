import { SliderPath } from "../../utils/SliderPath";
import { Vector2 } from "../../mathutil/Vector2";
import { HitObject } from "./HitObject";
import { HeadCircle } from "./sliderObjects/HeadCircle";
import { RepeatPoint } from "./sliderObjects/RepeatPoint";
import { SliderTick } from "./sliderObjects/SliderTick";
import { TailCircle } from "./sliderObjects/TailCircle";

/**
 * Represents a slider in a beatmap.
 */
export class Slider extends HitObject {
    /**
     * The repetition amount of the slider. Note that 1 repetition means no repeats (1 loop).
     */
    readonly repetitions: number;

    /**
     * The nested hitobjects of the slider. Consists of headcircle (sliderhead), slider ticks, repeat points, and tailcircle (sliderend).
     */
    readonly nestedHitObjects: HitObject[] = [];

    /**
     * The slider's path.
     */
    readonly path: SliderPath;

    /**
     * The slider's velocity.
     */
    readonly velocity: number;

    /**
     * The spacing between slider ticks of this slider.
     */
    readonly tickDistance: number;

    /**
     * The position of the cursor at the point of completion of this slider if it was hit
     * with as few movements as possible. This is set and used by difficulty calculation.
     */
    lazyEndPosition?: Vector2;

    /**
     * The distance travelled by the cursor upon completion of this slider if it was hit
     * with as few movements as possible. This is set and used by difficulty calculation.
     */
    lazyTravelDistance: number = 0;

    /**
     * The time taken by the cursor upon completion of this slider if it was hit with
     * as few movements as possible. This is set and used by difficulty calculation.
     */
    lazyTravelTime: number = 0;

    /**
     * The length of one span of this slider.
     */
    readonly spanDuration: number;

    /**
     * The slider's head (sliderhead).
     */
    readonly headCircle: HeadCircle;

    /**
     * The slider's tail (sliderend).
     */
    readonly tailCircle: TailCircle;

    /**
     * The duration of this slider.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * The amount of slider ticks in this slider.
     */
    get ticks(): number {
        return this.nestedHitObjects.filter((v) => v instanceof SliderTick)
            .length;
    }

    /**
     * The amount of repeat points in this slider.
     */
    get repeatPoints(): number {
        return this.nestedHitObjects.filter((v) => v instanceof RepeatPoint)
            .length;
    }

    static readonly legacyLastTickOffset: number = 36;

    constructor(values: {
        startTime: number;
        type: number;
        position: Vector2;
        repetitions: number;
        path: SliderPath;
        speedMultiplier: number;
        msPerBeat: number;
        mapSliderVelocity: number;
        mapTickRate: number;
        tickDistanceMultiplier: number;
    }) {
        super({
            endPosition: values.position.add(
                values.path.positionAt(values.repetitions % 2)
            ),
            ...values,
        });
        // Basically equal to span count
        this.repetitions = values.repetitions;
        this.path = values.path;

        const scoringDistance: number =
            100 * values.mapSliderVelocity * values.speedMultiplier;
        this.velocity = scoringDistance / values.msPerBeat;
        this.tickDistance =
            (scoringDistance / values.mapTickRate) *
            values.tickDistanceMultiplier;

        this.endTime =
            this.startTime +
            (this.repetitions * this.path.expectedDistance) / this.velocity;
        this.spanDuration = this.duration / this.repetitions;

        // Creating nested hit objects
        // Slider start
        this.headCircle = new HeadCircle({
            position: this.position,
            startTime: this.startTime,
            type: 0,
        });

        this.nestedHitObjects.push(this.headCircle);

        // Slider ticks and repeat points
        // A very lenient maximum length of a slider for ticks to be generated.
        // This exists for edge cases such as /b/1573664 where the beatmap has been edited by the user, and should never be reached in normal usage.
        const maxLength: number = 100000;
        const length: number = Math.min(maxLength, this.path.expectedDistance);
        const tickDistance: number = Math.min(
            Math.max(this.tickDistance, 0),
            length
        );

        if (tickDistance !== 0) {
            const minDistanceFromEnd: number = this.velocity * 10;

            for (let span = 0; span < this.repetitions; ++span) {
                const spanStartTime: number =
                    this.startTime + span * this.spanDuration;
                const reversed: boolean = span % 2 === 1;

                const sliderTicks: SliderTick[] = [];
                for (let d = tickDistance; d <= length; d += tickDistance) {
                    if (d >= length - minDistanceFromEnd) {
                        break;
                    }

                    // Always generate ticks from the start of the path rather than the span to ensure that ticks in repeat spans are positioned identically to those in non-repeat spans
                    const distanceProgress: number = d / length;
                    const timeProgress: number = reversed
                        ? 1 - distanceProgress
                        : distanceProgress;

                    const sliderTickPosition: Vector2 = this.position.add(
                        this.path.positionAt(distanceProgress)
                    );
                    const sliderTick: SliderTick = new SliderTick({
                        startTime:
                            spanStartTime + timeProgress * this.spanDuration,
                        position: sliderTickPosition,
                        spanIndex: span,
                        spanStartTime: spanStartTime,
                    });
                    sliderTicks.push(sliderTick);
                }

                // For repeat spans, ticks are returned in reverse-StartTime order.
                if (reversed) {
                    sliderTicks.reverse();
                }

                this.nestedHitObjects.push(...sliderTicks);

                if (span < this.repetitions - 1) {
                    const repeatPosition: Vector2 = this.position.add(
                        this.path.positionAt((span + 1) % 2)
                    );
                    const repeatPoint: RepeatPoint = new RepeatPoint({
                        position: repeatPosition,
                        startTime: spanStartTime + this.spanDuration,
                        repeatIndex: span,
                        spanDuration: this.spanDuration,
                    });
                    this.nestedHitObjects.push(repeatPoint);
                }
            }
        }

        // Okay, I'll level with you. I made a mistake. It was 2007.
        // Times were simpler. osu! was but in its infancy and sliders were a new concept.
        // A hack was made, which has unfortunately lived through until this day.
        //
        // This legacy tick is used for some calculations and judgements where audio output is not required.
        // Generally we are keeping this around just for difficulty compatibility.
        // Optimistically we do not want to ever use this for anything user-facing going forwards.
        const finalSpanIndex: number = this.repetitions - 1;
        const finalSpanStartTime: number =
            this.startTime + finalSpanIndex * this.spanDuration;
        const finalSpanEndTime: number = Math.max(
            this.startTime + this.duration / 2,
            finalSpanStartTime + this.spanDuration - Slider.legacyLastTickOffset
        );

        // Slider end
        this.tailCircle = new TailCircle({
            position: this.endPosition,
            startTime: finalSpanEndTime,
        });

        this.nestedHitObjects.push(this.tailCircle);

        this.nestedHitObjects.sort((a, b) => {
            return a.startTime - b.startTime;
        });
    }

    override toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], distance: ${
            this.path.expectedDistance
        }, repetitions: ${this.repetitions}, slider ticks: ${
            this.nestedHitObjects.filter((v) => v instanceof SliderTick).length
        }`;
    }
}
