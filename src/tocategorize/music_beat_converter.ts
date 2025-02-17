import Fraction from "fraction.js";
import { Timeline } from "../simulator/Timeline";

//TODO : Make vanilla timeline in utils rather than in simulator folder.
//TODO : Confusion in what a beat is (if sig 3/4 and tempo 1/4. Is beat : 0, 1, 2 or 0/4, 1/4, 2/4 ??)
export type MusicTime = [number, Fraction];

export class MusicBeatConverter {
    readonly signatureChanges: Timeline<number, Fraction>;

    constructor(signatureChanges: [number, Fraction][]) {
        this.signatureChanges = new Timeline(signatureChanges);
        if (this.signatureChanges.empty()) {
            throw Error("Must provide at least one signature.");
        }
    }

    // Checks if the beat is not outside the range of the measure.
    validateMusicTime([measure, beat]: MusicTime): boolean {
        let signature = this.signatureChanges.prev_event(measure, false)[1];
        if (signature === null) {
            signature = this.signatureChanges.begin().pointer[1];
        }
        return beat.lt(signature);
    }

    convertMeasureBeat(time: MusicTime): Fraction {
        // Initial validation for sanity.
        if (!this.validateMusicTime(time)) {
            throw Error("Beat is outside of measure.");
        }
        const [measure, beat] = time;

        // In case the measure we search for is before the first documented,
        // we take the initial signature.
        const it = this.signatureChanges.begin();
        let [currentMeasure, currentSignature] = it.pointer;
        if (measure < currentMeasure) {
            return currentSignature.mul(measure).add(beat);
        }

        // General Case.
        let beatAcc = currentSignature.mul(currentMeasure);
        it.next();
        while (it.isAccessible() && it.pointer[0] <= measure) {
            beatAcc = beatAcc.add(currentSignature.mul(it.pointer[0] - currentMeasure));
            [currentMeasure, currentSignature] = it.pointer;
            it.next();
        }
        return beatAcc.add(currentSignature.mul(measure - currentMeasure)).add(beat);
    }

    convertAbsoluteBeat(beat: Fraction): MusicTime {
        // Case when the beat is under the first known measure.
        const it = this.signatureChanges.begin();
        let [currentMeasure, currentSignature] = it.pointer;
        if (beat.lt(currentSignature.mul(currentMeasure))) {
            const measureAnswer = beat.div(currentSignature).floor().valueOf();
            // Not computing the modulo as it may be negative.
            const beatAnswer = beat.sub(currentSignature.mul(measureAnswer));
            return [measureAnswer, beatAnswer];
        }

        // General Case
        let beatAcc = currentSignature.mul(currentMeasure);
        it.next();
        while (
            it.isAccessible() &&
            beat.sub(beatAcc).gte(currentSignature.mul(it.pointer[0] - currentMeasure))
        ) {
            beatAcc = beatAcc.add(currentSignature.mul(it.pointer[0] - currentMeasure));
            [currentMeasure, currentSignature] = it.pointer;
            it.next();
        }
        const measureAnswer =
            currentMeasure + beat.sub(beatAcc).div(currentSignature).floor().valueOf();
        beatAcc = beatAcc.add(currentSignature.mul(measureAnswer - currentMeasure));
        const beatAnswer = beat.sub(beatAcc);
        return [measureAnswer, beatAnswer];
    }
}

//TODO : Use testing library ? Vitest ?
//TODO : Change prettier max char per line (100 is... big !)

// Testing
// console.log("Tests start.");
// const converter = new MusicBeatConverter([
//     [1, new Fraction("3/4")],
//     [3, new Fraction("1/2")],
//     [4, new Fraction("3/7")]
// ]);

// const validateTests: [MusicTime, boolean][] = [
//     [[-1, new Fraction("0")], true],
//     [[0, new Fraction("4/4")], false],
//     [[2, new Fraction("2/5")], true],
//     [[2, new Fraction("3/4")], false]
// ];
// for (const [time, answer] of validateTests) {
//     if (converter.validateMusicTime(time) !== answer) {
//         console.log("Error in validate.");
//     }
// }

// const convertTests: [MusicTime, Fraction][] = [
//     [[-1, new Fraction("0")], new Fraction("-3/4")],
//     [[1, new Fraction("0")], new Fraction("3/4")],
//     [[2, new Fraction("0")], new Fraction("6/4")],
//     [[3, new Fraction("0")], new Fraction("9/4")],
//     [[4, new Fraction("0")], new Fraction("11/4")],
//     [[5, new Fraction("0")], new Fraction("89/28")],
//     [[6, new Fraction("0")], new Fraction("101/28")],
//     [[-1, new Fraction("1/4")], new Fraction("-2/4")],
//     [[2, new Fraction("1/4")], new Fraction("7/4")],
//     [[6, new Fraction("1/7")], new Fraction("105/28")]
// ];
// for (const [time, absBeat] of convertTests) {
//     if (!converter.convertMeasureBeat(time).equals(absBeat)) {
//         console.log("Error in convertMeasureBeat.");
//     }
//     const answer = converter.convertAbsoluteBeat(absBeat);
//     if (!(answer[0] === time[0] && answer[1].equals(time[1]))) {
//         console.log("Error in convertMeasureBeat.");
//     }
// }
// console.log("Tests end.");
