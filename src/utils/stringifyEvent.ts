// Printing functions for events.

import Fraction from "fraction.js";
import { ParserTossMode } from "../parser/siteswap_mj/MusicalSiteswap";
import {
    FracSortedList,
    PartialBall,
    PartialBallsInHands,
    PartialTossMode
} from "../tocategorize/mj_parser";

type TossType = {
    from: { hand?: "L" | "R"; juggler?: string; beat?: Fraction };
    to: { hand?: "L" | "R" | "x"; juggler?: string; beat?: Fraction };
    ball: { name: string; id?: string } | { nameOrID?: string };
    mode?: ParserTossMode | PartialTossMode;
};

//TODO : Find a way to fuse all similar types ?
type EventType = {
    tosses?: TossType[];
    tempo?: Fraction;
    hands?: PartialBallsInHands;
    newDefaultHand?: "L" | "R";
};

export function stringifyEvents<T extends EventType>(events: FracSortedList<T> | T[]): string {
    if (events.length === 0) {
        return "";
    }
    let text = "";
    if (Array.isArray(events[0])) {
        for (const [beat, ev] of events as FracSortedList<T>) {
            text += `Beat ${stringifyFraction(beat)}`;
            text += "\n\t";
            text += stringifyEvent(ev).split("\n").join("\n\t");
            text += "\n";
        }
        return text;
    }
    for (let i = 0; i < events.length; i++) {
        text += `Time ${i}:`;
        text += "\n\t";
        text += stringifyEvent(events[i] as T)
            .split("\n")
            .join("\n\t");
        text += "\n";
    }
    return text;
}

export function stringifyEvent(ev: EventType): string {
    if (
        ev.newDefaultHand === undefined &&
        ev.tosses === undefined &&
        ev.hands === undefined &&
        ev.tempo === undefined
    ) {
        return "Empty Event.";
    }
    let text = "";
    if (ev.newDefaultHand !== undefined) {
        text += `New default hand: ${ev.newDefaultHand}.\n`;
    }
    if (ev.tempo !== undefined) {
        text += `Tempo Change: ${stringifyFraction(ev.tempo)}.\n`;
    }
    if (ev.hands !== undefined) {
        text += `New balls in hand: Left${stringifyHand(ev.hands[0])} Right${stringifyHand(ev.hands[1])}.\n`;
    }
    if (ev.tosses !== undefined) {
        for (let i = 0; i < ev.tosses.length; i++) {
            const toss = ev.tosses[i];
            text += `Toss ${i}: ${stringifyToss(toss)}.`;
            if (i < ev.tosses.length - 1) {
                text += "\n";
            }
        }
    }
    return text;
}

export function stringifyBall(ball: { name?: string; id?: string; nameOrID?: string }): string {
    let text = "Ball";
    if (ball.nameOrID !== undefined) {
        text += ` ${ball.nameOrID}`;
    } else if (ball.name !== undefined) {
        text += ` ${ball.name}`;
        if (ball.id !== undefined) {
            text += `(ID : ${ball.id})`;
        }
    } else if (ball.id !== undefined) {
        text += `(ID : ${ball.id})`;
    }
    return text;
}

export function stringifyHand(hand: PartialBall[]): string {
    let text = "";
    for (const ball of hand) {
        text += `${stringifyBall(ball)}, `;
    }
    return text;
}

export function stringifyFraction(f: Fraction, den: number | bigint = 1n): string {
    if (typeof den === "number") {
        den = BigInt(den);
    }
    return `${f.n * den}/${f.d * den}`;
}

export function stringifyHandSide(handSide: "L" | "R" | "x"): string {
    if (handSide === "L") {
        return "left";
    } else if (handSide === "R") {
        return "right";
    } else {
        return "other";
    }
}

function stringifyToFrom({
    hand,
    juggler,
    beat
}: {
    hand?: "L" | "R" | "x";
    juggler?: string;
    beat?: Fraction;
}): string {
    let text = "";
    if (juggler !== undefined) {
        text += juggler;
    }
    if (hand !== undefined) {
        const fromJugglerText = text === "" ? "" : "'s";
        text += `${fromJugglerText}${stringifyHandSide(hand)} hand`;
    }
    if (beat !== undefined) {
        text += ` (beat ${beat})`;
    }
    return text;
}

export function stringifyToss(toss: TossType): string {
    let text = stringifyBall(toss.ball);
    if (toss.mode === undefined) {
        text += "";
    } else if (toss.mode.type === "Height") {
        text += ` tossed at height ${toss.mode.height}`;
    } else if (toss.mode.type === "AbsBeat" || toss.mode.type === "Beat") {
        text += ` tossed to beat ${stringifyFraction(toss.mode.beat)}`;
    } else if (toss.mode.type === "AbsMeasureBeat") {
        const [measure, beat] = toss.mode.measureBeat;
        text += ` tossed to measure ${measure} beat ${stringifyFraction(beat)}`;
    } else {
        text += ` tossed to be caught in ${stringifyFraction(toss.mode.beat)} beats`;
    }
    const textFrom = stringifyToFrom(toss.from);
    if (textFrom !== "") {
        text += ` from ${textFrom}`;
    }
    const textTo = stringifyToFrom(toss.to);
    if (textTo !== "") {
        text += ` from ${textTo}`;
    }
    return text;
}
