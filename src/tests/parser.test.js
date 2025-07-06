const TinyPascalParser = require('../parser/parser');

describe('TinyPascalParser Lookahead Methods', () => {
    const mockTokens = [
        { type: 'NUMBER', value: 1, line: 1, column: 1 },
        { type: 'OPERATOR', value: '+', line: 1, column: 2 },
        { type: 'NUMBER', value: 2, line: 1, column: 3 },
        { type: 'EOF', value: null, line: 1, column: 4 }
    ];

    let parser;
    beforeEach(() => {
        parser = new TinyPascalParser(mockTokens);
    });

    test('peek() returns the current token', () => {
        expect(parser.peek()).toEqual(mockTokens[0]);
    });

    test('lookahead() returns the next token', () => {
        expect(parser.lookahead()).toEqual(mockTokens[1]);
    });

    test('advance() moves to the next token', () => {
        parser.advance();
        expect(parser.peek()).toEqual(mockTokens[1]);
        expect(parser.lookahead()).toEqual(mockTokens[2]);
    });

    test('advance() does not go past the last token', () => {
        parser.advance(); // +
        parser.advance(); // 2
        parser.advance(); // EOF
        parser.advance(); // Try to advance past EOF
        expect(parser.peek()).toEqual(mockTokens[3]);
        expect(parser.lookahead()).toBeUndefined();
    });
});

describe('TinyPascalParser parseProgram', () => {
    test('parseProgram recognizes basic program structure and consumes tokens', () => {
        // Simulate tokens: <globalDeclarations> <block> '.' EOF
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 }, // global declaration
            { type: 'KEYWORD', value: 'begin', line: 2, column: 1 }, // begin
            { type: 'NUMBER', value: 42, line: 2, column: 2 }, // inside block
            { type: 'KEYWORD', value: 'end', line: 2, column: 3 }, // end
            { type: 'PUNCTUATION', value: '.', line: 3, column: 1 }, // dot
            { type: 'EOF', value: null, line: 3, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        const ast = parser.parseProgram();
        expect(ast).toEqual({
            type: 'Program',
            globalDeclarations: {
                type: 'GlobalDeclarations',
                declarations: [
                    { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 }
                ]
            },
            block: {
                type: 'Block',
                blockTokens: [
                    { type: 'KEYWORD', value: 'begin', line: 2, column: 1 },
                    { type: 'NUMBER', value: 42, line: 2, column: 2 },
                    { type: 'KEYWORD', value: 'end', line: 2, column: 3 }
                ]
            }
        });
    });

    test("parseProgram throws error if missing '.' at the end", () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'begin', line: 2, column: 1 },
            { type: 'KEYWORD', value: 'end', line: 2, column: 2 },
            { type: 'EOF', value: null, line: 3, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProgram()).toThrow("Esperado '.' ao final do programa");
    });

    test("parseBlock throws error if missing 'begin'", () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'NUMBER', value: 42, line: 2, column: 2 },
            { type: 'KEYWORD', value: 'end', line: 2, column: 3 },
            { type: 'PUNCTUATION', value: '.', line: 3, column: 1 },
            { type: 'EOF', value: null, line: 3, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseGlobalDeclarations()).toThrow("Esperado 'begin' no início do bloco, encontrado: EOF");
    });

    test("parseBlock throws error if missing 'end'", () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'begin', line: 2, column: 1 },
            { type: 'NUMBER', value: 42, line: 2, column: 2 },
            { type: 'PUNCTUATION', value: '.', line: 3, column: 1 },
            { type: 'EOF', value: null, line: 3, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        parser.parseGlobalDeclarations();
        expect(() => parser.parseBlock()).toThrow("Esperado 'end' ao final do bloco, encontrado: EOF");
    });
});
