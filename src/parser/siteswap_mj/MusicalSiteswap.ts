/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import MJSiteswapParserVisitor from "./output/MJSiteswapParserVisitor";
import { PartialEvents, PartialToss } from "../../tocategorize/mj_parser";
import Fraction from "fraction.js";
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

type EventsList = [Fraction, PartialEvents][];

//TODO : useRightHand ambiguity : is it in the throws or not ?
// When L/R is specified -> gets fed in the event.
// When sync toss -> gets fed in the toss. RESOLVED. Document somewhere.
//TODO : Make custom class with no mutation ? (but composition)
//By passing time, and returning correct things ?
//TODO : Bug report that tokens may be null and are not marked as null in types.
//TODO : Ball Name / ID ?
//TODO : Consistant this.visit / this.visitSomething ?

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MJSVisitor extends MJSiteswapParserVisitor<any> {
    beat: Fraction;
    events: [Fraction, PartialEvents][] = [];
    lastTossSyncRhythm = false;
    readonly tempo: Fraction;
    readonly jugglerName: string;

    constructor(startBeat: Fraction, tempo: Fraction, jugglerName: string) {
        super();
        this.beat = startBeat.clone();
        this.tempo = tempo.clone();
        this.jugglerName = jugglerName;
    }

    addTossToEvents(tosses: PartialToss[], newDefaultHand?: "L" | "R"): void {
        let useRightHand: boolean | undefined;
        if (newDefaultHand === undefined) {
            useRightHand = undefined;
        } else {
            useRightHand = newDefaultHand === "R";
        }
        tosses = tosses.filter((toss) => {
            return toss.to.mode === "AsHeight"
                ? toss.to.height !== 0
                : !toss.to.beat.equals(this.beat); //TODO : Remove, shouldn't be in visitor ?
        });
        if (useRightHand !== undefined || tosses.length > 0) {
            this.events.push([
                this.beat,
                {
                    tosses: tosses,
                    useRightHand: useRightHand
                }
            ]);
        }
        this.beat = this.beat.add(this.tempo);
        if (this.lastTossSyncRhythm) {
            this.beat = this.beat.add(this.tempo);
        }
        this.lastTossSyncRhythm = false;
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

    visitTossVanilla = (ctx: TossVanillaContext): PartialToss => {
        const ballName: string | undefined = ctx.NAME()?.getText();
        const toHand = ctx.X_MOD() !== null ? "x" : undefined;
        const height = this.visit(ctx.height()) as number;
        return {
            ball: { name: ballName }, //TODO name id.
            from: { juggler: this.jugglerName, beat: this.beat },
            to: { juggler: this.jugglerName, mode: "AsHeight", height: height, hand: toHand }
        };
    };

    visitTossDetailed = (ctx: TossDetailedContext): PartialToss => {
        return this.visitDetailed_toss(ctx.detailed_toss());
    };

    visitAsyncToss = (ctx: AsyncTossContext): PartialToss[] => {
        return [this.visit(ctx.toss_info()) as PartialToss];
    };

    visitAsyncMultiplex = (ctx: AsyncMultiplexContext): PartialToss[] => {
        const tosses: PartialToss[] = [];
        for (const toss of ctx.toss_info_list()) {
            tosses.push(this.visit(toss) as PartialToss);
        }
        return tosses;
    };

    visitSync_toss = (ctx: Sync_tossContext): PartialToss[] => {
        const asyncTossLeft = this.visit(ctx.async_toss(0)) as PartialToss[];
        const asyncTossRight = this.visit(ctx.async_toss(1)) as PartialToss[];
        this.lastTossSyncRhythm = ctx.EXCL() === null;
        for (const toss of asyncTossLeft) {
            toss.from.hand = "L";
        }
        for (const toss of asyncTossRight) {
            toss.from.hand = "R";
        }
        return asyncTossLeft.concat(asyncTossRight);
    };

    visitToss = (ctx: TossContext): void => {
        const newDefaultHand = ctx.HAND_MOD()?.getText() as undefined | "L" | "R";
        const tosses = this.visit(ctx.getChild(ctx.getChildCount() - 1)) as PartialToss[];
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

    visitAbsMeasureAndBeat = (ctx: AbsMeasureAndBeatContext): Fraction => {
        //TODO
        throw Error("Not Implemented");
    };

    visitAbsBeatOnly = (ctx: AbsBeatOnlyContext): Fraction => {
        return this.visit(ctx.beat()) as Fraction;
    };

    visitRel_catch = (ctx: Rel_catchContext): Fraction => {
        return this.visit(ctx.beat()) as Fraction;
    };

    visitDetailed_toss = (ctx: Detailed_tossContext): PartialToss => {
        const names = ctx.NAME_list(); //TODO : Other solution by checking the list of allowed ball / juggler names ?
        const ball = ctx._ball !== undefined ? { name: names[0].getText() } : undefined;
        const toJugglerName =
            ctx._toJuggler !== undefined ? names[names.length - 1].getText() : this.jugglerName;
        let toMode: { mode: "ToBeat"; beat: Fraction } | { mode: "AsHeight"; height: number };
        if (ctx.height() !== null) {
            toMode = { mode: "AsHeight", height: this.visit(ctx.height()) as number };
        } else if (ctx.abs_catch() !== null) {
            toMode = { mode: "ToBeat", beat: this.visit(ctx.abs_catch()) as Fraction };
        } else {
            const relBeat = this.visit(ctx.rel_catch()) as Fraction;
            toMode = { mode: "ToBeat", beat: relBeat.add(this.beat) };
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
            ball: ball, //TODO name id.
            from: { juggler: this.jugglerName, beat: this.beat },
            to: { juggler: toJugglerName, hand: toHand, ...toMode }
        };
    };
}

import { CharStream, CommonTokenStream } from "antlr4";
import MJSiteswapLexer from "./output/MJSiteswapLexer";
import MJSiteswapParser from "./output/MJSiteswapParser";

export function parseMusicalSiteswap(
    pattern: string,
    options: { startBeat: Fraction; tempo: Fraction; name: string } = {
        startBeat: new Fraction(0),
        tempo: new Fraction(1),
        name: "NoName"
    }
): EventsList {
    const chars = new CharStream(pattern); // replace this with a FileStream as required
    const lexer = new MJSiteswapLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new MJSiteswapParser(tokens);
    const tree = parser.pattern();
    const visitor = new MJSVisitor(options.startBeat, options.tempo, options.name);
    tree.accept(visitor);
    return visitor.events;
}

export function prettyPrintEvents(events: EventsList) {
    for (const [time, { tosses, useRightHand }] of events) {
        console.log(
            `Time : ${time.toString()}
        Event useRightHand : ${useRightHand}`
        );
        if (tosses !== undefined) {
            console.log(`   Event tosses :`);
            for (const { ball, to, from } of tosses) {
                console.log(
                    `       Ball :
                Name : ${ball?.name}
                ID : ${ball?.id}
            Catch :
                Mode : ${to.mode}
                ${to.mode === "AsHeight" ? `Height : ${to.height}` : `Time: ${to.beat}`}
            From : 
                Name : ${from.juggler}
                Hand : ${from.hand}
                OnBeat : ${from.beat}
            To :
                Name : ${to.juggler}
                Hand : ${to.hand}`
                );
            }
        }
    }
}

// const input = "3";
// const input = "L404[Sol4 Do'5]1";
// const input = "{Do B5/4 Vincent x} {Do +B3/4 Vincent x} {Re 3 L}";
// const input = "R3 (1x {12} e)^3 (4,[82x]) (1, 0)! L5x 7";
// prettyPrintEvents(parseMusicalSiteswap(input));