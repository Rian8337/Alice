import { SliderPath } from '../../utils/SliderPath';
import { Vector2 } from '../../mathutil/Vector2';
import { HitObject } from './HitObject';
import { HeadCircle } from './sliderObjects/HeadCircle';
import { RepeatPoint } from './sliderObjects/RepeatPoint';
import { SliderTick } from './sliderObjects/SliderTick';
import { TailCircle } from './sliderObjects/TailCircle';

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
    readonly nestedHitObjects: HitObject[];

    /**
     * The slider's path.
     */
    readonly path: SliderPath;

    /**
     * The slider's end position.
     */
    readonly endPosition: Vector2;

    /**
     * The slider's velocity.
     */
    readonly velocity: number;

    /**
     * The tick distance of the slider.
     */
    readonly tickDistance: number;

    /**
     * The lazy end position of the slider.
     */
    lazyEndPosition?: Vector2;

    /**
     * The lazy travel distance of the slider.
     */
    lazyTravelDistance?: number;

    /**
     * The span duration (repeat duration) of the slider.
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
     * The duration of the slider.
     */
    readonly duration: number;

    private readonly legacyLastTickOffset: number = 36;
    
    constructor(values: {
        startTime: number,
        type: number,
        position: Vector2,
        repetitions: number,
        path: SliderPath,
        speedMultiplier: number,
        msPerBeat: number,
        mapSliderVelocity: number,
        mapTickRate: number
    }) {
        super(values);
        this.repetitions = values.repetitions;
        this.path = values.path;
        this.endPosition = this.position.add(this.path.positionAt(1));

        const scoringDistance: number = 100 * values.mapSliderVelocity * values.speedMultiplier;
        this.velocity = scoringDistance / values.msPerBeat;
        this.tickDistance = scoringDistance / values.mapTickRate;
        this.endTime = this.startTime + this.repetitions * this.path.expectedDistance / this.velocity;
        this.duration = this.endTime - this.startTime;
        this.spanDuration = this.duration / this.repetitions;

        // creating nested hit objects
        this.nestedHitObjects = [];

        // slider start and slider end
        this.headCircle = new HeadCircle({
            position: this.position,
            startTime: this.startTime,
            type: 0
        });

        this.tailCircle = new TailCircle({
            position: this.endPosition,
            startTime: this.endTime,
            type: 0
        });

        // slider ticks
        const maxLength: number = 100000;
        const length: number = Math.min(maxLength, this.path.expectedDistance);
        const tickDistance: number = Math.min(Math.max(this.tickDistance, 0), length);

        if (tickDistance === 0) {
            return;
        }

        const minDistanceFromEnd: number = this.velocity * 10;

        for (let span = 0; span < this.repetitions; ++span) {
            const spanStartTime: number = this.startTime + span * this.spanDuration;
            const reversed: boolean = span % 2 === 1;

            for (let d = tickDistance; d <= length; d += tickDistance) {
                if (d > length - minDistanceFromEnd) {
                    break;
                }

                const distanceProgress: number = d / length;
                const timeProgress: number = reversed ? 1 - distanceProgress : distanceProgress;

                const sliderTickPosition: Vector2 = this.position.add(this.path.positionAt(distanceProgress));
                const sliderTick: SliderTick = new SliderTick({
                    startTime: spanStartTime + timeProgress * this.spanDuration,
                    position: sliderTickPosition,
                    spanIndex: span,
                    spanStartTime: spanStartTime
                });
                this.nestedHitObjects.push(sliderTick);
            }
        }

        // repeat points
        for (let repeatIndex = 0, repeat = 1; repeatIndex < this.repetitions - 1; ++repeatIndex, ++repeat) {
            const repeatPosition: Vector2 = this.position.add(this.path.positionAt(repeat % 2));
            const repeatPoint: RepeatPoint = new RepeatPoint({
                position: repeatPosition,
                startTime: this.startTime + repeat * this.spanDuration,
                repeatIndex: repeatIndex,
                spanDuration: this.spanDuration
            });
            this.nestedHitObjects.push(repeatPoint);
        }

        this.tailCircle.startTime = Math.max(this.startTime + this.duration / 2, this.tailCircle.startTime - this.legacyLastTickOffset);

        this.nestedHitObjects.push(this.headCircle, this.tailCircle);
        this.nestedHitObjects.sort((a, b) => {
            return a.startTime - b.startTime;
        });
    }

    toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], distance: ${this.path.expectedDistance}, repetitions: ${this.repetitions}, slider ticks: ${this.nestedHitObjects.filter(v => v instanceof SliderTick).length}`;
    }
}