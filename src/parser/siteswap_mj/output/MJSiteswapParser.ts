// Generated from MJSiteswapParser.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import MJSiteswapParserListener from "./MJSiteswapParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class MJSiteswapParser extends Parser {
	public static readonly DIGIT = 1;
	public static readonly BIG_HEIGHT_DIGIT = 2;
	public static readonly LCUR = 3;
	public static readonly RCUR = 4;
	public static readonly REP = 5;
	public static readonly LPAR = 6;
	public static readonly RPAR = 7;
	public static readonly LSQU = 8;
	public static readonly RSQU = 9;
	public static readonly X_MOD = 10;
	public static readonly L_MOD = 11;
	public static readonly R_MOD = 12;
	public static readonly COMMA = 13;
	public static readonly EXCL = 14;
	public static readonly PLUS = 15;
	public static readonly BEAT = 16;
	public static readonly MEASURE = 17;
	public static readonly COMMENT = 18;
	public static readonly DIV = 19;
	public static readonly NAME = 20;
	public static readonly WS = 21;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_pattern = 0;
	public static readonly RULE_pattern_atom = 1;
	public static readonly RULE_number = 2;
	public static readonly RULE_height = 3;
	public static readonly RULE_throw_info = 4;
	public static readonly RULE_async_throw = 5;
	public static readonly RULE_sync_throw = 6;
	public static readonly RULE_throw = 7;
	public static readonly RULE_hand_mod = 8;
	public static readonly RULE_x_mod = 9;
	public static readonly RULE_excl_mod = 10;
	public static readonly RULE_name = 11;
	public static readonly RULE_measure = 12;
	public static readonly RULE_frac = 13;
	public static readonly RULE_beat = 14;
	public static readonly RULE_abs_catch = 15;
	public static readonly RULE_rel_catch = 16;
	public static readonly RULE_detailed_throw = 17;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            null, "'{'", 
                                                            "'}'", "'^'", 
                                                            "'('", "')'", 
                                                            "'['", "']'", 
                                                            "'x'", "'L'", 
                                                            "'R'", "','", 
                                                            "'!'", "'+'", 
                                                            "'B'", "'M'", 
                                                            null, "'/'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "DIGIT", 
                                                             "BIG_HEIGHT_DIGIT", 
                                                             "LCUR", "RCUR", 
                                                             "REP", "LPAR", 
                                                             "RPAR", "LSQU", 
                                                             "RSQU", "X_MOD", 
                                                             "L_MOD", "R_MOD", 
                                                             "COMMA", "EXCL", 
                                                             "PLUS", "BEAT", 
                                                             "MEASURE", 
                                                             "COMMENT", 
                                                             "DIV", "NAME", 
                                                             "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"pattern", "pattern_atom", "number", "height", "throw_info", "async_throw", 
		"sync_throw", "throw", "hand_mod", "x_mod", "excl_mod", "name", "measure", 
		"frac", "beat", "abs_catch", "rel_catch", "detailed_throw",
	];
	public get grammarFileName(): string { return "MJSiteswapParser.g4"; }
	public get literalNames(): (string | null)[] { return MJSiteswapParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return MJSiteswapParser.symbolicNames; }
	public get ruleNames(): string[] { return MJSiteswapParser.ruleNames; }
	public get serializedATN(): number[] { return MJSiteswapParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, MJSiteswapParser._ATN, MJSiteswapParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public pattern(): PatternContext {
		let localctx: PatternContext = new PatternContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, MJSiteswapParser.RULE_pattern);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 37;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 36;
				this.pattern_atom(0);
				}
				}
				this.state = 39;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1055054) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public pattern_atom(): Pattern_atomContext;
	public pattern_atom(_p: number): Pattern_atomContext;
	// @RuleVersion(0)
	public pattern_atom(_p?: number): Pattern_atomContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Pattern_atomContext = new Pattern_atomContext(this, this._ctx, _parentState);
		let _prevctx: Pattern_atomContext = localctx;
		let _startState: number = 2;
		this.enterRecursionRule(localctx, 2, MJSiteswapParser.RULE_pattern_atom, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 48;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				{
				this.state = 42;
				this.throw_();
				}
				break;
			case 2:
				{
				this.state = 43;
				this.match(MJSiteswapParser.LPAR);
				this.state = 44;
				this.pattern();
				this.state = 45;
				this.match(MJSiteswapParser.RPAR);
				}
				break;
			case 3:
				{
				this.state = 47;
				this.detailed_throw();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 61;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 3, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Pattern_atomContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, MJSiteswapParser.RULE_pattern_atom);
					this.state = 50;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 51;
					this.match(MJSiteswapParser.REP);
					this.state = 57;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case 1:
						{
						this.state = 52;
						this.number_();
						}
						break;
					case 6:
						{
						this.state = 53;
						this.match(MJSiteswapParser.LPAR);
						this.state = 54;
						this.number_();
						this.state = 55;
						this.match(MJSiteswapParser.RPAR);
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
				}
				this.state = 63;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 3, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public number_(): NumberContext {
		let localctx: NumberContext = new NumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, MJSiteswapParser.RULE_number);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 65;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 64;
					this.match(MJSiteswapParser.DIGIT);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 67;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public height(): HeightContext {
		let localctx: HeightContext = new HeightContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, MJSiteswapParser.RULE_height);
		try {
			this.state = 75;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 69;
				this.match(MJSiteswapParser.DIGIT);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 70;
				this.match(MJSiteswapParser.BIG_HEIGHT_DIGIT);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 71;
				this.match(MJSiteswapParser.LCUR);
				this.state = 72;
				this.number_();
				this.state = 73;
				this.match(MJSiteswapParser.RCUR);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public throw_info(): Throw_infoContext {
		let localctx: Throw_infoContext = new Throw_infoContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, MJSiteswapParser.RULE_throw_info);
		let _la: number;
		try {
			this.state = 85;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 78;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===20) {
					{
					this.state = 77;
					this.name();
					}
				}

				this.state = 80;
				this.height();
				this.state = 82;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
				case 1:
					{
					this.state = 81;
					this.x_mod();
					}
					break;
				}
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 84;
				this.detailed_throw();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public async_throw(): Async_throwContext {
		let localctx: Async_throwContext = new Async_throwContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, MJSiteswapParser.RULE_async_throw);
		let _la: number;
		try {
			this.state = 96;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
			case 2:
			case 3:
			case 20:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 87;
				this.throw_info();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 2);
				{
				{
				this.state = 88;
				this.match(MJSiteswapParser.LSQU);
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 89;
					this.throw_info();
					}
					}
					this.state = 92;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1048590) !== 0));
				this.state = 94;
				this.match(MJSiteswapParser.RSQU);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public sync_throw(): Sync_throwContext {
		let localctx: Sync_throwContext = new Sync_throwContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, MJSiteswapParser.RULE_sync_throw);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 98;
			this.match(MJSiteswapParser.LPAR);
			this.state = 99;
			this.async_throw();
			this.state = 100;
			this.match(MJSiteswapParser.COMMA);
			this.state = 101;
			this.async_throw();
			this.state = 102;
			this.match(MJSiteswapParser.RPAR);
			this.state = 104;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 11, this._ctx) ) {
			case 1:
				{
				this.state = 103;
				this.excl_mod();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public throw_(): ThrowContext {
		let localctx: ThrowContext = new ThrowContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, MJSiteswapParser.RULE_throw);
		let _la: number;
		try {
			this.state = 111;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
			case 2:
			case 3:
			case 8:
			case 11:
			case 12:
			case 20:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 107;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11 || _la===12) {
					{
					this.state = 106;
					this.hand_mod();
					}
				}

				this.state = 109;
				this.async_throw();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 110;
				this.sync_throw();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public hand_mod(): Hand_modContext {
		let localctx: Hand_modContext = new Hand_modContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, MJSiteswapParser.RULE_hand_mod);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 113;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===12)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public x_mod(): X_modContext {
		let localctx: X_modContext = new X_modContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, MJSiteswapParser.RULE_x_mod);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 115;
			this.match(MJSiteswapParser.X_MOD);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public excl_mod(): Excl_modContext {
		let localctx: Excl_modContext = new Excl_modContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, MJSiteswapParser.RULE_excl_mod);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 117;
			this.match(MJSiteswapParser.EXCL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public name(): NameContext {
		let localctx: NameContext = new NameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, MJSiteswapParser.RULE_name);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 119;
			this.match(MJSiteswapParser.NAME);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public measure(): MeasureContext {
		let localctx: MeasureContext = new MeasureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, MJSiteswapParser.RULE_measure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 121;
			this.match(MJSiteswapParser.MEASURE);
			this.state = 122;
			this.number_();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public frac(): FracContext {
		let localctx: FracContext = new FracContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, MJSiteswapParser.RULE_frac);
		try {
			this.state = 129;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 124;
				this.number_();
				this.state = 125;
				this.match(MJSiteswapParser.DIV);
				this.state = 126;
				this.number_();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 128;
				this.number_();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public beat(): BeatContext {
		let localctx: BeatContext = new BeatContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, MJSiteswapParser.RULE_beat);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 131;
			this.match(MJSiteswapParser.BEAT);
			this.state = 132;
			this.frac();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public abs_catch(): Abs_catchContext {
		let localctx: Abs_catchContext = new Abs_catchContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, MJSiteswapParser.RULE_abs_catch);
		try {
			this.state = 138;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 17:
				this.enterOuterAlt(localctx, 1);
				{
				{
				this.state = 134;
				this.measure();
				this.state = 135;
				this.beat();
				}
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 137;
				this.beat();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rel_catch(): Rel_catchContext {
		let localctx: Rel_catchContext = new Rel_catchContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, MJSiteswapParser.RULE_rel_catch);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 140;
			this.match(MJSiteswapParser.PLUS);
			this.state = 141;
			this.beat();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public detailed_throw(): Detailed_throwContext {
		let localctx: Detailed_throwContext = new Detailed_throwContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, MJSiteswapParser.RULE_detailed_throw);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 143;
			this.match(MJSiteswapParser.LCUR);
			this.state = 145;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===20) {
				{
				this.state = 144;
				this.name();
				}
			}

			this.state = 150;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
			case 2:
			case 3:
				{
				this.state = 147;
				this.height();
				}
				break;
			case 16:
			case 17:
				{
				this.state = 148;
				this.abs_catch();
				}
				break;
			case 15:
				{
				this.state = 149;
				this.rel_catch();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 153;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===20) {
				{
				this.state = 152;
				this.name();
				}
			}

			this.state = 157;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 11:
			case 12:
				{
				this.state = 155;
				this.hand_mod();
				}
				break;
			case 10:
				{
				this.state = 156;
				this.x_mod();
				}
				break;
			case 4:
				break;
			default:
				break;
			}
			this.state = 159;
			this.match(MJSiteswapParser.RCUR);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.pattern_atom_sempred(localctx as Pattern_atomContext, predIndex);
		}
		return true;
	}
	private pattern_atom_sempred(localctx: Pattern_atomContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,21,162,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,1,0,4,0,38,8,0,11,0,12,0,39,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,49,8,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,58,8,1,5,1,60,8,1,10,1,12,1,63,9,1,1,2,
	4,2,66,8,2,11,2,12,2,67,1,3,1,3,1,3,1,3,1,3,1,3,3,3,76,8,3,1,4,3,4,79,8,
	4,1,4,1,4,3,4,83,8,4,1,4,3,4,86,8,4,1,5,1,5,1,5,4,5,91,8,5,11,5,12,5,92,
	1,5,1,5,3,5,97,8,5,1,6,1,6,1,6,1,6,1,6,1,6,3,6,105,8,6,1,7,3,7,108,8,7,
	1,7,1,7,3,7,112,8,7,1,8,1,8,1,9,1,9,1,10,1,10,1,11,1,11,1,12,1,12,1,12,
	1,13,1,13,1,13,1,13,1,13,3,13,130,8,13,1,14,1,14,1,14,1,15,1,15,1,15,1,
	15,3,15,139,8,15,1,16,1,16,1,16,1,17,1,17,3,17,146,8,17,1,17,1,17,1,17,
	3,17,151,8,17,1,17,3,17,154,8,17,1,17,1,17,3,17,158,8,17,1,17,1,17,1,17,
	0,1,2,18,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,0,1,1,0,11,12,
	167,0,37,1,0,0,0,2,48,1,0,0,0,4,65,1,0,0,0,6,75,1,0,0,0,8,85,1,0,0,0,10,
	96,1,0,0,0,12,98,1,0,0,0,14,111,1,0,0,0,16,113,1,0,0,0,18,115,1,0,0,0,20,
	117,1,0,0,0,22,119,1,0,0,0,24,121,1,0,0,0,26,129,1,0,0,0,28,131,1,0,0,0,
	30,138,1,0,0,0,32,140,1,0,0,0,34,143,1,0,0,0,36,38,3,2,1,0,37,36,1,0,0,
	0,38,39,1,0,0,0,39,37,1,0,0,0,39,40,1,0,0,0,40,1,1,0,0,0,41,42,6,1,-1,0,
	42,49,3,14,7,0,43,44,5,6,0,0,44,45,3,0,0,0,45,46,5,7,0,0,46,49,1,0,0,0,
	47,49,3,34,17,0,48,41,1,0,0,0,48,43,1,0,0,0,48,47,1,0,0,0,49,61,1,0,0,0,
	50,51,10,2,0,0,51,57,5,5,0,0,52,58,3,4,2,0,53,54,5,6,0,0,54,55,3,4,2,0,
	55,56,5,7,0,0,56,58,1,0,0,0,57,52,1,0,0,0,57,53,1,0,0,0,58,60,1,0,0,0,59,
	50,1,0,0,0,60,63,1,0,0,0,61,59,1,0,0,0,61,62,1,0,0,0,62,3,1,0,0,0,63,61,
	1,0,0,0,64,66,5,1,0,0,65,64,1,0,0,0,66,67,1,0,0,0,67,65,1,0,0,0,67,68,1,
	0,0,0,68,5,1,0,0,0,69,76,5,1,0,0,70,76,5,2,0,0,71,72,5,3,0,0,72,73,3,4,
	2,0,73,74,5,4,0,0,74,76,1,0,0,0,75,69,1,0,0,0,75,70,1,0,0,0,75,71,1,0,0,
	0,76,7,1,0,0,0,77,79,3,22,11,0,78,77,1,0,0,0,78,79,1,0,0,0,79,80,1,0,0,
	0,80,82,3,6,3,0,81,83,3,18,9,0,82,81,1,0,0,0,82,83,1,0,0,0,83,86,1,0,0,
	0,84,86,3,34,17,0,85,78,1,0,0,0,85,84,1,0,0,0,86,9,1,0,0,0,87,97,3,8,4,
	0,88,90,5,8,0,0,89,91,3,8,4,0,90,89,1,0,0,0,91,92,1,0,0,0,92,90,1,0,0,0,
	92,93,1,0,0,0,93,94,1,0,0,0,94,95,5,9,0,0,95,97,1,0,0,0,96,87,1,0,0,0,96,
	88,1,0,0,0,97,11,1,0,0,0,98,99,5,6,0,0,99,100,3,10,5,0,100,101,5,13,0,0,
	101,102,3,10,5,0,102,104,5,7,0,0,103,105,3,20,10,0,104,103,1,0,0,0,104,
	105,1,0,0,0,105,13,1,0,0,0,106,108,3,16,8,0,107,106,1,0,0,0,107,108,1,0,
	0,0,108,109,1,0,0,0,109,112,3,10,5,0,110,112,3,12,6,0,111,107,1,0,0,0,111,
	110,1,0,0,0,112,15,1,0,0,0,113,114,7,0,0,0,114,17,1,0,0,0,115,116,5,10,
	0,0,116,19,1,0,0,0,117,118,5,14,0,0,118,21,1,0,0,0,119,120,5,20,0,0,120,
	23,1,0,0,0,121,122,5,17,0,0,122,123,3,4,2,0,123,25,1,0,0,0,124,125,3,4,
	2,0,125,126,5,19,0,0,126,127,3,4,2,0,127,130,1,0,0,0,128,130,3,4,2,0,129,
	124,1,0,0,0,129,128,1,0,0,0,130,27,1,0,0,0,131,132,5,16,0,0,132,133,3,26,
	13,0,133,29,1,0,0,0,134,135,3,24,12,0,135,136,3,28,14,0,136,139,1,0,0,0,
	137,139,3,28,14,0,138,134,1,0,0,0,138,137,1,0,0,0,139,31,1,0,0,0,140,141,
	5,15,0,0,141,142,3,28,14,0,142,33,1,0,0,0,143,145,5,3,0,0,144,146,3,22,
	11,0,145,144,1,0,0,0,145,146,1,0,0,0,146,150,1,0,0,0,147,151,3,6,3,0,148,
	151,3,30,15,0,149,151,3,32,16,0,150,147,1,0,0,0,150,148,1,0,0,0,150,149,
	1,0,0,0,151,153,1,0,0,0,152,154,3,22,11,0,153,152,1,0,0,0,153,154,1,0,0,
	0,154,157,1,0,0,0,155,158,3,16,8,0,156,158,3,18,9,0,157,155,1,0,0,0,157,
	156,1,0,0,0,157,158,1,0,0,0,158,159,1,0,0,0,159,160,5,4,0,0,160,35,1,0,
	0,0,20,39,48,57,61,67,75,78,82,85,92,96,104,107,111,129,138,145,150,153,
	157];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!MJSiteswapParser.__ATN) {
			MJSiteswapParser.__ATN = new ATNDeserializer().deserialize(MJSiteswapParser._serializedATN);
		}

		return MJSiteswapParser.__ATN;
	}


	static DecisionsToDFA = MJSiteswapParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class PatternContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public pattern_atom_list(): Pattern_atomContext[] {
		return this.getTypedRuleContexts(Pattern_atomContext) as Pattern_atomContext[];
	}
	public pattern_atom(i: number): Pattern_atomContext {
		return this.getTypedRuleContext(Pattern_atomContext, i) as Pattern_atomContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_pattern;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterPattern) {
	 		listener.enterPattern(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitPattern) {
	 		listener.exitPattern(this);
		}
	}
}


export class Pattern_atomContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public throw_(): ThrowContext {
		return this.getTypedRuleContext(ThrowContext, 0) as ThrowContext;
	}
	public LPAR(): TerminalNode {
		return this.getToken(MJSiteswapParser.LPAR, 0);
	}
	public pattern(): PatternContext {
		return this.getTypedRuleContext(PatternContext, 0) as PatternContext;
	}
	public RPAR(): TerminalNode {
		return this.getToken(MJSiteswapParser.RPAR, 0);
	}
	public detailed_throw(): Detailed_throwContext {
		return this.getTypedRuleContext(Detailed_throwContext, 0) as Detailed_throwContext;
	}
	public pattern_atom(): Pattern_atomContext {
		return this.getTypedRuleContext(Pattern_atomContext, 0) as Pattern_atomContext;
	}
	public REP(): TerminalNode {
		return this.getToken(MJSiteswapParser.REP, 0);
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_pattern_atom;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterPattern_atom) {
	 		listener.enterPattern_atom(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitPattern_atom) {
	 		listener.exitPattern_atom(this);
		}
	}
}


export class NumberContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DIGIT_list(): TerminalNode[] {
	    	return this.getTokens(MJSiteswapParser.DIGIT);
	}
	public DIGIT(i: number): TerminalNode {
		return this.getToken(MJSiteswapParser.DIGIT, i);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_number;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterNumber) {
	 		listener.enterNumber(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitNumber) {
	 		listener.exitNumber(this);
		}
	}
}


export class HeightContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DIGIT(): TerminalNode {
		return this.getToken(MJSiteswapParser.DIGIT, 0);
	}
	public BIG_HEIGHT_DIGIT(): TerminalNode {
		return this.getToken(MJSiteswapParser.BIG_HEIGHT_DIGIT, 0);
	}
	public LCUR(): TerminalNode {
		return this.getToken(MJSiteswapParser.LCUR, 0);
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
	public RCUR(): TerminalNode {
		return this.getToken(MJSiteswapParser.RCUR, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_height;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterHeight) {
	 		listener.enterHeight(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitHeight) {
	 		listener.exitHeight(this);
		}
	}
}


export class Throw_infoContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public height(): HeightContext {
		return this.getTypedRuleContext(HeightContext, 0) as HeightContext;
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
	public x_mod(): X_modContext {
		return this.getTypedRuleContext(X_modContext, 0) as X_modContext;
	}
	public detailed_throw(): Detailed_throwContext {
		return this.getTypedRuleContext(Detailed_throwContext, 0) as Detailed_throwContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_throw_info;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterThrow_info) {
	 		listener.enterThrow_info(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitThrow_info) {
	 		listener.exitThrow_info(this);
		}
	}
}


export class Async_throwContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public throw_info_list(): Throw_infoContext[] {
		return this.getTypedRuleContexts(Throw_infoContext) as Throw_infoContext[];
	}
	public throw_info(i: number): Throw_infoContext {
		return this.getTypedRuleContext(Throw_infoContext, i) as Throw_infoContext;
	}
	public LSQU(): TerminalNode {
		return this.getToken(MJSiteswapParser.LSQU, 0);
	}
	public RSQU(): TerminalNode {
		return this.getToken(MJSiteswapParser.RSQU, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_async_throw;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterAsync_throw) {
	 		listener.enterAsync_throw(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitAsync_throw) {
	 		listener.exitAsync_throw(this);
		}
	}
}


export class Sync_throwContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LPAR(): TerminalNode {
		return this.getToken(MJSiteswapParser.LPAR, 0);
	}
	public async_throw_list(): Async_throwContext[] {
		return this.getTypedRuleContexts(Async_throwContext) as Async_throwContext[];
	}
	public async_throw(i: number): Async_throwContext {
		return this.getTypedRuleContext(Async_throwContext, i) as Async_throwContext;
	}
	public COMMA(): TerminalNode {
		return this.getToken(MJSiteswapParser.COMMA, 0);
	}
	public RPAR(): TerminalNode {
		return this.getToken(MJSiteswapParser.RPAR, 0);
	}
	public excl_mod(): Excl_modContext {
		return this.getTypedRuleContext(Excl_modContext, 0) as Excl_modContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_sync_throw;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterSync_throw) {
	 		listener.enterSync_throw(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitSync_throw) {
	 		listener.exitSync_throw(this);
		}
	}
}


export class ThrowContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public async_throw(): Async_throwContext {
		return this.getTypedRuleContext(Async_throwContext, 0) as Async_throwContext;
	}
	public hand_mod(): Hand_modContext {
		return this.getTypedRuleContext(Hand_modContext, 0) as Hand_modContext;
	}
	public sync_throw(): Sync_throwContext {
		return this.getTypedRuleContext(Sync_throwContext, 0) as Sync_throwContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_throw;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterThrow) {
	 		listener.enterThrow(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitThrow) {
	 		listener.exitThrow(this);
		}
	}
}


export class Hand_modContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public L_MOD(): TerminalNode {
		return this.getToken(MJSiteswapParser.L_MOD, 0);
	}
	public R_MOD(): TerminalNode {
		return this.getToken(MJSiteswapParser.R_MOD, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_hand_mod;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterHand_mod) {
	 		listener.enterHand_mod(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitHand_mod) {
	 		listener.exitHand_mod(this);
		}
	}
}


export class X_modContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public X_MOD(): TerminalNode {
		return this.getToken(MJSiteswapParser.X_MOD, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_x_mod;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterX_mod) {
	 		listener.enterX_mod(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitX_mod) {
	 		listener.exitX_mod(this);
		}
	}
}


export class Excl_modContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EXCL(): TerminalNode {
		return this.getToken(MJSiteswapParser.EXCL, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_excl_mod;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterExcl_mod) {
	 		listener.enterExcl_mod(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitExcl_mod) {
	 		listener.exitExcl_mod(this);
		}
	}
}


export class NameContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NAME(): TerminalNode {
		return this.getToken(MJSiteswapParser.NAME, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_name;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterName) {
	 		listener.enterName(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitName) {
	 		listener.exitName(this);
		}
	}
}


export class MeasureContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public MEASURE(): TerminalNode {
		return this.getToken(MJSiteswapParser.MEASURE, 0);
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_measure;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterMeasure) {
	 		listener.enterMeasure(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitMeasure) {
	 		listener.exitMeasure(this);
		}
	}
}


export class FracContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public number__list(): NumberContext[] {
		return this.getTypedRuleContexts(NumberContext) as NumberContext[];
	}
	public number_(i: number): NumberContext {
		return this.getTypedRuleContext(NumberContext, i) as NumberContext;
	}
	public DIV(): TerminalNode {
		return this.getToken(MJSiteswapParser.DIV, 0);
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_frac;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterFrac) {
	 		listener.enterFrac(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitFrac) {
	 		listener.exitFrac(this);
		}
	}
}


export class BeatContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BEAT(): TerminalNode {
		return this.getToken(MJSiteswapParser.BEAT, 0);
	}
	public frac(): FracContext {
		return this.getTypedRuleContext(FracContext, 0) as FracContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_beat;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterBeat) {
	 		listener.enterBeat(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitBeat) {
	 		listener.exitBeat(this);
		}
	}
}


export class Abs_catchContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public measure(): MeasureContext {
		return this.getTypedRuleContext(MeasureContext, 0) as MeasureContext;
	}
	public beat(): BeatContext {
		return this.getTypedRuleContext(BeatContext, 0) as BeatContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_abs_catch;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterAbs_catch) {
	 		listener.enterAbs_catch(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitAbs_catch) {
	 		listener.exitAbs_catch(this);
		}
	}
}


export class Rel_catchContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PLUS(): TerminalNode {
		return this.getToken(MJSiteswapParser.PLUS, 0);
	}
	public beat(): BeatContext {
		return this.getTypedRuleContext(BeatContext, 0) as BeatContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_rel_catch;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterRel_catch) {
	 		listener.enterRel_catch(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitRel_catch) {
	 		listener.exitRel_catch(this);
		}
	}
}


export class Detailed_throwContext extends ParserRuleContext {
	constructor(parser?: MJSiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LCUR(): TerminalNode {
		return this.getToken(MJSiteswapParser.LCUR, 0);
	}
	public RCUR(): TerminalNode {
		return this.getToken(MJSiteswapParser.RCUR, 0);
	}
	public height(): HeightContext {
		return this.getTypedRuleContext(HeightContext, 0) as HeightContext;
	}
	public abs_catch(): Abs_catchContext {
		return this.getTypedRuleContext(Abs_catchContext, 0) as Abs_catchContext;
	}
	public rel_catch(): Rel_catchContext {
		return this.getTypedRuleContext(Rel_catchContext, 0) as Rel_catchContext;
	}
	public name_list(): NameContext[] {
		return this.getTypedRuleContexts(NameContext) as NameContext[];
	}
	public name(i: number): NameContext {
		return this.getTypedRuleContext(NameContext, i) as NameContext;
	}
	public hand_mod(): Hand_modContext {
		return this.getTypedRuleContext(Hand_modContext, 0) as Hand_modContext;
	}
	public x_mod(): X_modContext {
		return this.getTypedRuleContext(X_modContext, 0) as X_modContext;
	}
    public get ruleIndex(): number {
    	return MJSiteswapParser.RULE_detailed_throw;
	}
	public enterRule(listener: MJSiteswapParserListener): void {
	    if(listener.enterDetailed_throw) {
	 		listener.enterDetailed_throw(this);
		}
	}
	public exitRule(listener: MJSiteswapParserListener): void {
	    if(listener.exitDetailed_throw) {
	 		listener.exitDetailed_throw(this);
		}
	}
}
