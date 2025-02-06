// antlr4-parse SiteswapLexer.g4 SiteswapParser.g4 pattern example.txt -gui antlr4
// -Dlanguage=TypeScript SiteswapLexer.g4 SiteswapParser.g4 -o outputfiles

// TODO to be on par with juggling lab : mirror * + passing p + exclamation mark !

parser grammar SiteswapParser;
options {
	tokenVocab = SiteswapLexer;
}
pattern: pattern_atom+;
pattern_atom: throw | '(' pattern ')' | pattern_atom '^' NUMBER;
height: (DIGIT | '{' NUMBER '}') x_mod?;
async_throw: height | '[' height+ ']';
sync_throw: '(' async_throw ',' async_throw ')' excl_mod?;
throw: hand_mod? (sync_throw | async_throw);
hand_mod: L_MOD | R_MOD;
x_mod: X_MOD;
excl_mod: EXCL;