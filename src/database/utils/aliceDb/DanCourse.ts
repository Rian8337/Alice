import { DatabaseManager } from "@database/DatabaseManager";
import { OperationResult } from "@structures/core/OperationResult";
import { DanCoursePassRequirement } from "@structures/dancourse/DanCoursePassRequirement";
import { DatabaseDanCourse } from "@structures/database/aliceDb/DatabaseDanCourse";
import { Manager } from "@utils/base/Manager";
import { StringHelper } from "@utils/helpers/StringHelper";
import { Snowflake } from "discord.js";
import { ObjectId } from "mongodb";
import { DanCourseScore } from "./DanCourseScore";

/**
 * Represents a dan course.
 */
export class DanCourse extends Manager implements DatabaseDanCourse {
    courseName: string;
    hash: string;
    requirement: DanCoursePassRequirement;
    fileName: string;
    roleId: Snowflake;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseDanCourse = DatabaseManager.aliceDb?.collections
            .danCourses.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.courseName = data.courseName;
        this.hash = data.hash;
        this.requirement = data.requirement;
        this.fileName = data.fileName;
        this.roleId = data.roleId;
    }

    /**
     * Checks whether a score passes this course.
     *
     * @param score The score to check.
     * @returns Whether the score passed the course.
     */
    isScorePassed(score: DanCourseScore): OperationResult {
        let mods: string = "";
        let forcedAR: number | undefined;
        let speedMultiplier: number = 1;

        for (const s of score.modstring.split("|")) {
            if (!s) {
                continue;
            }

            if (s.startsWith("AR")) {
                forcedAR = parseFloat(s.replace("AR", ""));
            } else if (s.startsWith("x")) {
                speedMultiplier = parseFloat(s.slice(1));
            } else {
                mods += s;
            }
        }

        // TODO: localize these

        if (
            StringHelper.sortAlphabet(this.requirement.requiredMods ?? "") !==
            StringHelper.sortAlphabet(mods)
        ) {
            return this.createOperationResult(false, "Invalid mods were used");
        }

        if (forcedAR !== undefined) {
            if (this.requirement.forcedAR === undefined) {
                return this.createOperationResult(
                    false,
                    "Invalid force AR settings was used",
                );
            }

            if (
                this.requirement.forcedAR.minValue !== undefined &&
                forcedAR < this.requirement.forcedAR.minValue
            ) {
                return this.createOperationResult(
                    false,
                    `Force AR settings was too low, minimum is ${this.requirement.forcedAR.minValue} but was set to ${forcedAR}`,
                );
            }

            if (
                this.requirement.forcedAR.maxValue !== undefined &&
                forcedAR > this.requirement.forcedAR.maxValue
            ) {
                return this.createOperationResult(
                    false,
                    `Force AR settings was too high, maximum is ${this.requirement.forcedAR.maxValue} but was set to ${forcedAR}`,
                );
            }
        }

        if ((this.requirement.speedMultiplier ?? 1) !== speedMultiplier) {
            return this.createOperationResult(
                false,
                `Invalid speed multiplier was used, must be ${
                    this.requirement.speedMultiplier ?? 1
                } but was ${speedMultiplier}`,
            );
        }

        if (score.isSliderLock && !this.requirement.allowSliderLock) {
            return this.createOperationResult(
                false,
                "Slider lock was activated",
            );
        }

        if (
            this.requirement.forceSliderAccuracy &&
            score.useSliderAccuracy !== this.requirement.forceSliderAccuracy
        ) {
            return this.createOperationResult(
                false,
                "Slider accuracy was not used",
            );
        }

        switch (this.requirement.id) {
            case "score":
            case "combo":
            case "m300":
            case "rank":
                return this.createOperationResult(
                    score.grade >= this.requirement.value,
                    "Pass requirement was not met",
                );
            case "acc":
                return this.createOperationResult(
                    score.grade * 100 >= this.requirement.value,
                    "Pass requirement was not met",
                );
            default:
                return this.createOperationResult(
                    score.grade <= this.requirement.value,
                    "Pass requirement was not met",
                );
        }
    }
}
