import Fraction from "fraction.js";
import { Ball, FracSortedList } from "./mj_parser";
import { MusicBeatConverter, MusicTime } from "./music_beat_converter";

export type RawPreParserEvent = {
    tempo?: string;
    hands?: [string[], string[]];
    pattern?: string /*; useHand?: "L" | "R" */;
};

export type PreParserEvent = {
    tempo?: Fraction;
    hands?: [string[], string[]];
    pattern?: string /*; useHand?: "L" | "R" */;
};

export interface TheWholeThingParams {
    jugglers: Map<
        string,
        { events: FracSortedList<RawPreParserEvent>; startingBalls: Set<string> }
    >;
    ballNames?: Set<string>;
    ballIDs?: Map<string, string>;
    musicConverter?: MusicBeatConverter;
}

export function theWholeThing({
    jugglers,
    ballNames,
    ballIDs,
    musicConverter
}: TheWholeThingParams) {}

export function formatJugglerBalls(
    commonBallNames: string[],
    jugglersSpecificBallNames: { name: string; ballNames: string[] }[]
): { name: string; balls: Ball[] }[] {
    const jugglerBalls: { name: string; balls: Ball[] }[] = [];
    for (const { name: jugglerName, ballNames: specificBallNames } of jugglersSpecificBallNames) {
        const balls: Ball[] = [];
        for (const ball of [...commonBallNames, ...specificBallNames]) {
            balls.push({ name: ball, id: ball + "?" + jugglerName });
        }
        jugglerBalls.push({ name: jugglerName, balls: balls });
    }
    return jugglerBalls;
}

export function formatRawTime(time: string): Fraction | MusicTime {
    const numbers = time.replace(" ", "").split(",");
    if (numbers.length < 1 || numbers.length > 2) {
        throw Error(`Can't understand provided time : ${time}`);
    }
    if (numbers.length === 1) {
        return new Fraction(numbers[0]);
    }
    return [parseInt(numbers[0]), new Fraction(numbers[1])];
}

//TODO : add beat to the object rather than have a 2-array element.
//TODO : useHand ?

//TODO : Use ErrorHandler ?
export function formatRawEventInput(
    rawEvents: [string, RawPreParserEvent][],
    musicConverter?: MusicBeatConverter
): [Fraction, PreParserEvent][] {
    const formattedEvents: [Fraction, PreParserEvent][] = [];
    for (const [rawTime, rawEv] of rawEvents) {
        let time = formatRawTime(rawTime);
        if (Array.isArray(time)) {
            if (musicConverter === undefined) {
                throw Error("No Signature information was provided to be able to use measures");
            }
            time = musicConverter.convertMeasureToBeat(time);
        }
        const tempo = rawEv.tempo === undefined ? undefined : new Fraction(rawEv.tempo);
        formattedEvents.push([time, { ...rawEv, tempo: tempo }]);
    }
    return formattedEvents;
}
