# Parsers with ANTLR4

## ANTLR4

We use the ANTLR4 tool to generate from a grammer file and some lexer/parser code that can be executed with the ANTLR typescript library.

If any changes are made to the parser, they should be recompiled.

For convenience, we provide a MakeFile in each parser folder.

TODO : ANTLR4 Installation
TODO : Automatic compilation when building ?

## Testing

```sh
antlr4-parse <lexer_file> <parser_file> <entry_rule_in_parser> <input_file_to_test> -gui
```

For instance : 

```sh
antlr4-parse ExprLexer.g4 ExprParser.g4 program test.txt -gui
```

## Compiling

Both the lexer and the parser must be compiled in that order.

```sh
antlr4 -Dlanguage=TypeScript <lexer_file> <parser_file>
```

For instance : 

```sh
antlr4 -Dlanguage=TypeScript ExprLexer.g4 ExprParser.g4
```
