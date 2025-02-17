/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { CharStream, CommonTokenStream, Parser } from "antlr4";
import MJSiteswapLexer from "./output/MJSiteswapLexer";
import MJSiteswapParser from "./output/MJSiteswapParser";
import MJSiteswapParserVisitor from "./output/MJSiteswapParserVisitor";
import {
    AbsBeatOnlyContext,
    AbsMeasureAndBeatContext,
    AsyncMultiplexContext,
    AsyncTossContext,
    BeatFracContext,
    BeatWholeNumberContext,
    Detailed_tossContext,
    FracContext,
    HeightAccContext,
    HeightBigDigitContext,
    HeightDigitContext,
    MeasureContext,
    NumberContext,
    PatternContext,
    Rel_catchContext,
    Sync_tossContext,
    TossContext,
    TossDetailedContext,
    PatternExpContext,
    PatternParContext,
    PatternTossContext,
    TossVanillaContext
} from "./output/MJSiteswapParser";
import { PartialEvents, PartialToss } from "../../tocategorize/mj_parser";
import Fraction from "fraction.js";
import { MusicBeatConverter, MusicTime } from "../../tocategorize/musicBeatConverter";

//TODO : useRightHand ambiguity : is it in the throws or not ?
// When L/R is specified -> gets fed in the event.
// When sync toss -> gets fed in the toss. RESOLVED. Document somewhere.
//TODO : Make custom class with no mutation ? (but composition)
//By passing time, and returning correct things ?
//TODO : Bug report that tokens may be null and are not marked as null in types.
//TODO : Ball Name / ID ?
//TODO : Consistant this.visit / this.visitSomething ?
//TODO : Remove as much as possible from the parser : We can add the tempo later, and filter music / beat later too ?
// What we can do later than parser (possibly changing a bit the format):
// -Check for time requirements (measure and beat / beat)
// -Remove empty events / With height 0 / Caught on same beat as thrown
// What if expend way later on this grammar to add features (inline tempo changes, frac throws etc ?)
//TODO : Get the line / char number also to throw better errors ?
//TODO : Rename MusicTime to smth else ? Measure&Beat ?
//TODO in further checks : Juggler Name + Rel to Abs Beat + Remove empty events (h=0, catchBeat=throwBeat)

type ParserToss = {
    ballNameOrID?: string;
    fromHand?: "L" | "R";
    toJuggler?: string;
    toHand?: "L" | "R" | "x";
} & TossMode;

type TossMode =
    | { mode: "Height"; height: number }
    | { mode: "AbsBeat"; beat: Fraction }
    | { mode: "AbsMeasureBeat"; measureBeat: MusicTime }
    | { mode: "RelBeat"; beat: Fraction };

type ParserJugglingEvent = {
    newDefaultHand?: "L" | "R";
    tosses?: ParserToss[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MJSVisitor extends MJSiteswapParserVisitor<any> {
    events: ParserJugglingEvent[] = [];
    private _lastTossSyncRhythm = false;

    addTossToEvents(tosses: ParserToss[], newDefaultHand?: "L" | "R"): void {
        this.events.push({ newDefaultHand: newDefaultHand, tosses: tosses });
        if (this._lastTossSyncRhythm) {
            this.events.push({});
        }
        this._lastTossSyncRhythm = false;
    }

    visitPattern = (ctx: PatternContext): void => {
        for (const patternAtom of ctx.pattern_atom_list()) {
            this.visit(patternAtom);
        }
    };

    visitPatternToss = (ctx: PatternTossContext): void => {
        this.visitToss(ctx.toss());
    };

    visitPatternExp = (ctx: PatternExpContext): void => {
        const exp = this.visitNumber(ctx.number_());
        for (let i = 0; i < exp; i++) {
            this.visit(ctx.pattern_atom());
        }
    };

    visitPatternPar = (ctx: PatternParContext): void => {
        for (const patternAtomCtx of ctx.pattern_atom_list()) {
            this.visit(patternAtomCtx);
        }
    };

    visitNumber = (ctx: NumberContext): number => {
        const digits = ctx.DIGIT_list().reverse();
        let acc = 0;
        for (let i = 0; i < digits.length; i++) {
            acc += 10 ** i * parseInt(digits[i].getText());
        }
        return acc;
    };

    visitHeightDigit = (ctx: HeightDigitContext): number => {
        return parseInt(ctx.DIGIT().getText());
    };

    visitHeightBigDigit = (ctx: HeightBigDigitContext): number => {
        // 97 is the ASCII / Unicode code for "a".
        // We map "a" to 10, "b" to 11, ...
        return ctx.BIG_HEIGHT_DIGIT().getText().charCodeAt(0) - 87;
    };

    visitHeightAcc = (ctx: HeightAccContext): number => {
        return this.visitNumber(ctx.number_());
    };

    visitTossVanilla = (ctx: TossVanillaContext): ParserToss => {
        const ballNameOrID: string | undefined = ctx.NAME()?.getText();
        const toHand = ctx.X_MOD() !== null ? "x" : undefined;
        const height = this.visit(ctx.height()) as number;
        return {
            ballNameOrID: ballNameOrID,
            toHand: toHand,
            mode: "Height",
            height: height
        };
    };

    visitTossDetailed = (ctx: TossDetailedContext): ParserToss => {
        return this.visitDetailed_toss(ctx.detailed_toss());
    };

    visitAsyncToss = (ctx: AsyncTossContext): ParserToss[] => {
        return [this.visit(ctx.toss_info()) as ParserToss];
    };

    visitAsyncMultiplex = (ctx: AsyncMultiplexContext): ParserToss[] => {
        const tosses: ParserToss[] = [];
        for (const toss of ctx.toss_info_list()) {
            tosses.push(this.visit(toss) as ParserToss);
        }
        return tosses;
    };

    visitSync_toss = (ctx: Sync_tossContext): ParserToss[] => {
        const asyncTossLeft = this.visit(ctx.async_toss(0)) as ParserToss[];
        const asyncTossRight = this.visit(ctx.async_toss(1)) as ParserToss[];
        this._lastTossSyncRhythm = ctx.EXCL() === null;
        for (const toss of asyncTossLeft) {
            toss.fromHand = "L";
        }
        for (const toss of asyncTossRight) {
            toss.fromHand = "R";
        }
        return asyncTossLeft.concat(asyncTossRight);
    };

    visitToss = (ctx: TossContext): void => {
        const newDefaultHand = ctx.HAND_MOD()?.getText() as undefined | "L" | "R";
        const tosses = this.visit(ctx.getChild(ctx.getChildCount() - 1)) as ParserToss[];
        this.addTossToEvents(tosses, newDefaultHand);
    };

    visitMeasure = (ctx: MeasureContext): number => {
        return this.visitNumber(ctx.number_());
    };

    visitFrac = (ctx: FracContext): Fraction => {
        const num = this.visitNumber(ctx.number_(0));
        const den = this.visitNumber(ctx.number_(1));
        return new Fraction(num, den);
    };

    visitBeatFrac = (ctx: BeatFracContext): Fraction => {
        return this.visitFrac(ctx.frac());
    };

    visitBeatWholeNumber = (ctx: BeatWholeNumberContext): Fraction => {
        return new Fraction(this.visitNumber(ctx.number_()));
    };

    visitAbsMeasureAndBeat = (ctx: AbsMeasureAndBeatContext): MusicTime => {
        const measure = this.visitMeasure(ctx.measure());
        const beat = this.visit(ctx.beat()) as Fraction;
        return [measure, beat];
    };

    visitAbsBeatOnly = (ctx: AbsBeatOnlyContext): Fraction => {
        return this.visit(ctx.beat()) as Fraction;
    };

    visitRel_catch = (ctx: Rel_catchContext): Fraction => {
        return this.visit(ctx.beat()) as Fraction;
    };

    visitDetailed_toss = (ctx: Detailed_tossContext): ParserToss => {
        const names = ctx.NAME_list();
        let namesIdx = 0;
        let ballNameOrID: string | undefined = undefined;
        let toJugglerName: string | undefined = undefined;
        if (ctx._ball !== undefined) {
            ballNameOrID = names[namesIdx].getText();
            namesIdx++;
        }
        if (ctx._toJuggler !== undefined) {
            toJugglerName = names[namesIdx].getText();
            namesIdx++;
        }
        let tossMode: TossMode;
        if (ctx.height() !== null) {
            tossMode = { mode: "Height", height: this.visit(ctx.height()) as number };
        } else if (ctx.abs_catch() !== null) {
            const absTime = this.visit(ctx.abs_catch()) as Fraction | MusicTime;
            if (Array.isArray(absTime)) {
                tossMode = { mode: "AbsMeasureBeat", measureBeat: absTime };
            } else {
                tossMode = { mode: "AbsBeat", beat: absTime };
            }
        } else {
            tossMode = { mode: "RelBeat", beat: this.visit(ctx.rel_catch()) as Fraction };
        }
        let toHand: "L" | "R" | "x" | undefined;
        if (ctx.HAND_MOD() !== null) {
            toHand = ctx.HAND_MOD().getText() as "L" | "R";
        } else if (ctx.X_MOD() !== null) {
            toHand = "x";
        } else {
            toHand = undefined;
        }
        return {
            ballNameOrID: ballNameOrID,
            toHand: toHand,
            toJuggler: toJugglerName,
            ...tossMode
        };
    };
}

export function parseMusicalSiteswap(pattern: string): ParserJugglingEvent[] {
    const chars = new CharStream(pattern); // replace this with a FileStream as required
    const lexer = new MJSiteswapLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new MJSiteswapParser(tokens);
    const tree = parser.pattern();
    const visitor = new MJSVisitor();
    tree.accept(visitor);
    return visitor.events;
}

function stringifyFraction(f: Fraction): string {
    return `${f.n}/${f.d}`;
}

function stringifyEvent(ev: ParserJugglingEvent): string {
    if (ev.newDefaultHand === undefined && ev.tosses === undefined) {
        return "\tEmpty Event.";
    }
    let text = "";
    if (ev.newDefaultHand !== undefined) {
        text += `\tnewDefaultHand: ${ev.newDefaultHand}\n`;
    }
    if (ev.tosses !== undefined) {
        for (let i = 0; i < ev.tosses.length; i++) {
            const toss = ev.tosses[i];
            text += `\tToss ${i}: Ball `;
            if (toss.ballNameOrID !== undefined) {
                text += `${toss.ballNameOrID} `;
            }
            if (toss.mode === "Height") {
                text += `tossed at height ${toss.height} `;
            } else if (toss.mode === "AbsBeat") {
                text += `tossed to beat ${stringifyFraction(toss.beat)} `;
            } else if (toss.mode === "AbsMeasureBeat") {
                const [measure, beat] = toss.measureBeat;
                text += `tossed to measure ${measure} beat ${stringifyFraction(beat)} $`;
            } else {
                text += `tossed to be caught in ${stringifyFraction(toss.beat)} beats `;
            }
            if (toss.fromHand !== undefined) {
                const hand = toss.fromHand === "L" ? "left" : "right";
                text += `from the ${hand} hand `;
            }
            if (toss.toHand !== undefined || toss.toJuggler !== undefined) {
                text += `to `;
                if (toss.toJuggler !== undefined) {
                    text += `${toss.toJuggler}'s `;
                }
                if (toss.toHand !== undefined) {
                    let hand: string;
                    if (toss.toHand === "L") {
                        hand = "left";
                    } else if (toss.toHand === "R") {
                        hand = "right";
                    } else {
                        hand = "other";
                    }
                    text += `${hand} hand `;
                }
            }
            if (i < ev.tosses.length - 1) {
                text += "\n";
            }
        }
    }
    return text;
}

function stringifyEvents(events: ParserJugglingEvent[]) {
    let text = "";
    for (let i = 0; i < events.length; i++) {
        text += `Time ${i}:\n`;
        text += stringifyEvent(events[i]) + "\n";
    }
    return text;
}

// const input = "3";
// const input = "L404[Sol4 Do'5]1";
// const input = "{Do B5/4 Vincent x} {Do +B3/4 Vincent x} {Re 3 L}";
// const input = "R3 (1x {12} e)^3 (4,[82x]) (1, 0)! L5x 7";
// const input = "R(3)^3";
// const input = "{M1B1/4}303{Do M3B1/3}";
// console.log(stringifyEvents(parseMusicalSiteswap(input)));


// type EventsList = [Fraction, PartialEvents][];

// interface MJSVisitorConstructorParameters {
//     startBeat: Fraction;
//     tempo: Fraction;
//     jugglerName: string;
//     musicConverter?: MusicBeatConverter;
// }

// export class MJSVisitor extends MJSiteswapParserVisitor<any> {
//     beat: Fraction;
//     events: [Fraction, PartialEvents][] = [];
//     private _lastTossSyncRhythm = false;
//     readonly tempo: Fraction;
//     readonly jugglerName: string;
//     readonly musicConverter?: MusicBeatConverter;

//     constructor({
//         startBeat,
//         tempo,
//         jugglerName,
//         musicConverter
//     }: MJSVisitorConstructorParameters) {
//         super();
//         this.beat = startBeat.clone();
//         this.tempo = tempo.clone();
//         this.jugglerName = jugglerName;
//         this.musicConverter = musicConverter;
//     }

//     addTossToEvents(tosses: PartialToss[], newDefaultHand?: "L" | "R"): void {
//         let useRightHand: boolean | undefined;
//         if (newDefaultHand === undefined) {
//             useRightHand = undefined;
//         } else {
//             useRightHand = newDefaultHand === "R";
//         }
//         tosses = tosses.filter((toss) => {
//             return toss.to.mode === "AsHeight"
//                 ? toss.to.height !== 0
//                 : !toss.to.beat.equals(this.beat); //TODO : Remove, shouldn't be in visitor ?
//         });
//         if (useRightHand !== undefined || tosses.length > 0) {
//             this.events.push([
//                 this.beat,
//                 {
//                     tosses: tosses,
//                     useRightHand: useRightHand
//                 }
//             ]);
//         }
//         this.beat = this.beat.add(this.tempo);
//         if (this.lastTossSyncRhythm) {
//             this.beat = this.beat.add(this.tempo);
//         }
//         this.lastTossSyncRhythm = false;
//     }

//     visitPattern = (ctx: PatternContext): void => {
//         for (const patternAtom of ctx.pattern_atom_list()) {
//             this.visit(patternAtom);
//         }
//     };

//     visitPatternToss = (ctx: PatternTossContext): void => {
//         this.visitToss(ctx.toss());
//     };

//     visitPatternExp = (ctx: PatternExpContext): void => {
//         const exp = this.visitNumber(ctx.number_());
//         for (let i = 0; i < exp; i++) {
//             this.visit(ctx.pattern_atom());
//         }
//     };

//     visitPatternPar = (ctx: PatternParContext): void => {
//         for (const patternAtomCtx of ctx.pattern_atom_list()) {
//             this.visit(patternAtomCtx);
//         }
//     };

//     visitNumber = (ctx: NumberContext): number => {
//         const digits = ctx.DIGIT_list().reverse();
//         let acc = 0;
//         for (let i = 0; i < digits.length; i++) {
//             acc += 10 ** i * parseInt(digits[i].getText());
//         }
//         return acc;
//     };

//     visitHeightDigit = (ctx: HeightDigitContext): number => {
//         return parseInt(ctx.DIGIT().getText());
//     };

//     visitHeightBigDigit = (ctx: HeightBigDigitContext): number => {
//         // 97 is the ASCII / Unicode code for "a".
//         // We map "a" to 10, "b" to 11, ...
//         return ctx.BIG_HEIGHT_DIGIT().getText().charCodeAt(0) - 87;
//     };

//     visitHeightAcc = (ctx: HeightAccContext): number => {
//         return this.visitNumber(ctx.number_());
//     };

//     visitTossVanilla = (ctx: TossVanillaContext): PartialToss => {
//         const ballName: string | undefined = ctx.NAME()?.getText();
//         const toHand = ctx.X_MOD() !== null ? "x" : undefined;
//         const height = this.visit(ctx.height()) as number;
//         return {
//             ball: { name: ballName }, //TODO name id.
//             from: { juggler: this.jugglerName, beat: this.beat },
//             to: { juggler: this.jugglerName, mode: "AsHeight", height: height, hand: toHand }
//         };
//     };

//     visitTossDetailed = (ctx: TossDetailedContext): PartialToss => {
//         return this.visitDetailed_toss(ctx.detailed_toss());
//     };

//     visitAsyncToss = (ctx: AsyncTossContext): PartialToss[] => {
//         return [this.visit(ctx.toss_info()) as PartialToss];
//     };

//     visitAsyncMultiplex = (ctx: AsyncMultiplexContext): PartialToss[] => {
//         const tosses: PartialToss[] = [];
//         for (const toss of ctx.toss_info_list()) {
//             tosses.push(this.visit(toss) as PartialToss);
//         }
//         return tosses;
//     };

//     visitSync_toss = (ctx: Sync_tossContext): PartialToss[] => {
//         const asyncTossLeft = this.visit(ctx.async_toss(0)) as PartialToss[];
//         const asyncTossRight = this.visit(ctx.async_toss(1)) as PartialToss[];
//         this.lastTossSyncRhythm = ctx.EXCL() === null;
//         for (const toss of asyncTossLeft) {
//             toss.from.hand = "L";
//         }
//         for (const toss of asyncTossRight) {
//             toss.from.hand = "R";
//         }
//         return asyncTossLeft.concat(asyncTossRight);
//     };

//     visitToss = (ctx: TossContext): void => {
//         const newDefaultHand = ctx.HAND_MOD()?.getText() as undefined | "L" | "R";
//         const tosses = this.visit(ctx.getChild(ctx.getChildCount() - 1)) as PartialToss[];
//         this.addTossToEvents(tosses, newDefaultHand);
//     };

//     visitMeasure = (ctx: MeasureContext): number => {
//         return this.visitNumber(ctx.number_());
//     };

//     visitFrac = (ctx: FracContext): Fraction => {
//         const num = this.visitNumber(ctx.number_(0));
//         const den = this.visitNumber(ctx.number_(1));
//         return new Fraction(num, den);
//     };

//     visitBeatFrac = (ctx: BeatFracContext): Fraction => {
//         return this.visitFrac(ctx.frac());
//     };

//     visitBeatWholeNumber = (ctx: BeatWholeNumberContext): Fraction => {
//         return new Fraction(this.visitNumber(ctx.number_()));
//     };

//     visitAbsMeasureAndBeat = (ctx: AbsMeasureAndBeatContext): Fraction => {
//         if (this.musicConverter === undefined) {
//             throw Error(
//                 "No Signature information was provided to constructor to be able to use measures."
//             );
//         }
//         const measure = this.visitMeasure(ctx.measure());
//         const beat = this.visit(ctx.beat()) as Fraction;
//         return this.musicConverter.convertMeasureBeat([measure, beat]);
//     };

//     visitAbsBeatOnly = (ctx: AbsBeatOnlyContext): Fraction => {
//         return this.visit(ctx.beat()) as Fraction;
//     };

//     visitRel_catch = (ctx: Rel_catchContext): Fraction => {
//         return this.visit(ctx.beat()) as Fraction;
//     };

//     visitDetailed_toss = (ctx: Detailed_tossContext): PartialToss => {
//         const names = ctx.NAME_list(); //TODO : Other solution by checking the list of allowed ball / juggler names ?
//         const ball = ctx._ball !== undefined ? { name: names[0].getText() } : undefined;
//         const toJugglerName =
//             ctx._toJuggler !== undefined ? names[names.length - 1].getText() : this.jugglerName;
//         let toMode: { mode: "ToBeat"; beat: Fraction } | { mode: "AsHeight"; height: number };
//         if (ctx.height() !== null) {
//             toMode = { mode: "AsHeight", height: this.visit(ctx.height()) as number };
//         } else if (ctx.abs_catch() !== null) {
//             toMode = { mode: "ToBeat", beat: this.visit(ctx.abs_catch()) as Fraction };
//         } else {
//             const relBeat = this.visit(ctx.rel_catch()) as Fraction;
//             toMode = { mode: "ToBeat", beat: relBeat.add(this.beat) };
//         }
//         let toHand: "L" | "R" | "x" | undefined;
//         if (ctx.HAND_MOD() !== null) {
//             toHand = ctx.HAND_MOD().getText() as "L" | "R";
//         } else if (ctx.X_MOD() !== null) {
//             toHand = "x";
//         } else {
//             toHand = undefined;
//         }
//         return {
//             ball: ball, //TODO name id.
//             from: { juggler: this.jugglerName, beat: this.beat },
//             to: { juggler: toJugglerName, hand: toHand, ...toMode }
//         };
//     };
// }

// export function parseMusicalSiteswap(
//     pattern: string,
//     options: MJSVisitorConstructorParameters = {
//         startBeat: new Fraction(0),
//         tempo: new Fraction(1),
//         jugglerName: "NoName"
//     }
// ): EventsList {
//     const chars = new CharStream(pattern); // replace this with a FileStream as required
//     const lexer = new MJSiteswapLexer(chars);
//     const tokens = new CommonTokenStream(lexer);
//     const parser = new MJSiteswapParser(tokens);
//     const tree = parser.pattern();
//     const visitor = new MJSVisitor(options);
//     tree.accept(visitor);
//     return visitor.events;
// }

// export function prettyPrintEvents(events: EventsList) {
//     for (const [time, { tosses, useRightHand }] of events) {
//         console.log(
//             `Time : ${time.toString()}
//         Event useRightHand : ${useRightHand}`
//         );
//         if (tosses !== undefined) {
//             console.log(`   Event tosses :`);
//             for (const { ball, to, from } of tosses) {
//                 console.log(
//                     `       Ball :
//                 Name : ${ball?.name}
//                 ID : ${ball?.id}
//             Catch :
//                 Mode : ${to.mode}
//                 ${to.mode === "AsHeight" ? `Height : ${to.height}` : `Time: ${to.beat}`}
//             From :
//                 Name : ${from.juggler}
//                 Hand : ${from.hand}
//                 OnBeat : ${from.beat}
//             To :
//                 Name : ${to.juggler}
//                 Hand : ${to.hand}`
//                 );
//             }
//         }
//     }
// }
