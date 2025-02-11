// antlr4-parse SiteswapLexer.g4 SiteswapParser.g4 pattern example.txt -gui antlr4
// -Dlanguage=TypeScript SiteswapLexer.g4 SiteswapParser.g4 -o outputfiles
parser grammar MJSiteswapParser;
options {
	tokenVocab = MJSiteswapLexer;
}
// pattern: pattern_atom+;
pattern: pattern_atom+;
pattern_atom:
	throw
	| '(' pattern ')'
	| pattern_atom '^' (number | '(' number ')')
	| detailed_throw;

// Siteswap (normal + note)
number: DIGIT+;
height: DIGIT | BIG_HEIGHT_DIGIT | '{' number '}';
throw_info: name? height x_mod? | detailed_throw;
async_throw: throw_info | ('[' throw_info+ ']');
sync_throw: '(' async_throw ',' async_throw ')' excl_mod?;
throw: hand_mod? async_throw | sync_throw;
hand_mod: 'L' | 'R';
x_mod: 'x';
excl_mod: '!';
name: NAME;

// Siteswap (musical)
measure: 'M' number;
frac: number DIV number | number;
beat: 'B' frac;
abs_catch: (measure beat) | beat;
rel_catch: '+' beat;
detailed_throw:
	'{' name? (height | abs_catch | rel_catch) name? (
		hand_mod
		| x_mod
	)? '}';