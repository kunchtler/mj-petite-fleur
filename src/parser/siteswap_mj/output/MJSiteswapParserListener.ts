// Generated from MJSiteswapParser.g4 by ANTLR 4.13.2

import {ParseTreeListener} from "antlr4";


import { PatternContext } from "./MJSiteswapParser.js";
import { Pattern_atomContext } from "./MJSiteswapParser.js";
import { NumberContext } from "./MJSiteswapParser.js";
import { HeightContext } from "./MJSiteswapParser.js";
import { Throw_infoContext } from "./MJSiteswapParser.js";
import { Async_throwContext } from "./MJSiteswapParser.js";
import { Sync_throwContext } from "./MJSiteswapParser.js";
import { ThrowContext } from "./MJSiteswapParser.js";
import { Hand_modContext } from "./MJSiteswapParser.js";
import { X_modContext } from "./MJSiteswapParser.js";
import { Excl_modContext } from "./MJSiteswapParser.js";
import { NameContext } from "./MJSiteswapParser.js";
import { MeasureContext } from "./MJSiteswapParser.js";
import { FracContext } from "./MJSiteswapParser.js";
import { BeatContext } from "./MJSiteswapParser.js";
import { Abs_catchContext } from "./MJSiteswapParser.js";
import { Rel_catchContext } from "./MJSiteswapParser.js";
import { Detailed_throwContext } from "./MJSiteswapParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `MJSiteswapParser`.
 */
export default class MJSiteswapParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.pattern`.
	 * @param ctx the parse tree
	 */
	enterPattern?: (ctx: PatternContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.pattern`.
	 * @param ctx the parse tree
	 */
	exitPattern?: (ctx: PatternContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.pattern_atom`.
	 * @param ctx the parse tree
	 */
	enterPattern_atom?: (ctx: Pattern_atomContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.pattern_atom`.
	 * @param ctx the parse tree
	 */
	exitPattern_atom?: (ctx: Pattern_atomContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.number`.
	 * @param ctx the parse tree
	 */
	enterNumber?: (ctx: NumberContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.number`.
	 * @param ctx the parse tree
	 */
	exitNumber?: (ctx: NumberContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.height`.
	 * @param ctx the parse tree
	 */
	enterHeight?: (ctx: HeightContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.height`.
	 * @param ctx the parse tree
	 */
	exitHeight?: (ctx: HeightContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.throw_info`.
	 * @param ctx the parse tree
	 */
	enterThrow_info?: (ctx: Throw_infoContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.throw_info`.
	 * @param ctx the parse tree
	 */
	exitThrow_info?: (ctx: Throw_infoContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.async_throw`.
	 * @param ctx the parse tree
	 */
	enterAsync_throw?: (ctx: Async_throwContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.async_throw`.
	 * @param ctx the parse tree
	 */
	exitAsync_throw?: (ctx: Async_throwContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.sync_throw`.
	 * @param ctx the parse tree
	 */
	enterSync_throw?: (ctx: Sync_throwContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.sync_throw`.
	 * @param ctx the parse tree
	 */
	exitSync_throw?: (ctx: Sync_throwContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.throw`.
	 * @param ctx the parse tree
	 */
	enterThrow?: (ctx: ThrowContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.throw`.
	 * @param ctx the parse tree
	 */
	exitThrow?: (ctx: ThrowContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.hand_mod`.
	 * @param ctx the parse tree
	 */
	enterHand_mod?: (ctx: Hand_modContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.hand_mod`.
	 * @param ctx the parse tree
	 */
	exitHand_mod?: (ctx: Hand_modContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.x_mod`.
	 * @param ctx the parse tree
	 */
	enterX_mod?: (ctx: X_modContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.x_mod`.
	 * @param ctx the parse tree
	 */
	exitX_mod?: (ctx: X_modContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.excl_mod`.
	 * @param ctx the parse tree
	 */
	enterExcl_mod?: (ctx: Excl_modContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.excl_mod`.
	 * @param ctx the parse tree
	 */
	exitExcl_mod?: (ctx: Excl_modContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.name`.
	 * @param ctx the parse tree
	 */
	enterName?: (ctx: NameContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.name`.
	 * @param ctx the parse tree
	 */
	exitName?: (ctx: NameContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.measure`.
	 * @param ctx the parse tree
	 */
	enterMeasure?: (ctx: MeasureContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.measure`.
	 * @param ctx the parse tree
	 */
	exitMeasure?: (ctx: MeasureContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.frac`.
	 * @param ctx the parse tree
	 */
	enterFrac?: (ctx: FracContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.frac`.
	 * @param ctx the parse tree
	 */
	exitFrac?: (ctx: FracContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.beat`.
	 * @param ctx the parse tree
	 */
	enterBeat?: (ctx: BeatContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.beat`.
	 * @param ctx the parse tree
	 */
	exitBeat?: (ctx: BeatContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.abs_catch`.
	 * @param ctx the parse tree
	 */
	enterAbs_catch?: (ctx: Abs_catchContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.abs_catch`.
	 * @param ctx the parse tree
	 */
	exitAbs_catch?: (ctx: Abs_catchContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.rel_catch`.
	 * @param ctx the parse tree
	 */
	enterRel_catch?: (ctx: Rel_catchContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.rel_catch`.
	 * @param ctx the parse tree
	 */
	exitRel_catch?: (ctx: Rel_catchContext) => void;
	/**
	 * Enter a parse tree produced by `MJSiteswapParser.detailed_throw`.
	 * @param ctx the parse tree
	 */
	enterDetailed_throw?: (ctx: Detailed_throwContext) => void;
	/**
	 * Exit a parse tree produced by `MJSiteswapParser.detailed_throw`.
	 * @param ctx the parse tree
	 */
	exitDetailed_throw?: (ctx: Detailed_throwContext) => void;
}

