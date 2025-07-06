const TinyPascalParser = require('../parser/parser');
const { TokenType } = require('../lexer/tokens');

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


describe('TinyPascalParser - parseType', () => {
    test('parseType reconhece integer', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'integer', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseType();
        expect(result).toEqual({ type: 'Type', value: 'integer' });
    });

    test('parseType reconhece boolean', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'boolean', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseType();
        expect(result).toEqual({ type: 'Type', value: 'boolean' });
    });

    test('parseType lança erro para tipo inválido', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'string', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseType()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });

    test('parseType lança erro para identificador', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseType()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });

    test('parseType lança erro para EOF', () => {
        const tokens = [
            { type: 'EOF', value: null, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseType()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });
});

describe('TinyPascalParser - parseVarList', () => {
    test('parseVarList reconhece um identificador', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseVarList();
        expect(result).toEqual(['x']);
    });

    test('parseVarList reconhece múltiplos identificadores separados por vírgula', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'IDENTIFIER', value: 'z', line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseVarList();
        expect(result).toEqual(['x', 'y', 'z']);
    });

    test('parseVarList lança erro se não começa com identificador', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: ',', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarList()).toThrow(/Esperado identificador em declaração de variável/);
    });

    test('parseVarList lança erro se não há identificador após vírgula', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarList()).toThrow(/Esperado identificador após ',' em declaração de variável/);
    });

    test('parseVarList lança erro para duas vírgulas seguidas', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 5 },
            { type: 'IDENTIFIER', value: 'z', line: 1, column: 6 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarList()).toThrow(/Esperado identificador após ',' em declaração de variável/);
    });
});

describe('TinyPascalParser - parseVarDeclaration', () => {
    test('parseVarDeclaration reconhece declaração simples', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'var', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 5 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 6 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 7 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 14 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseVarDeclaration();
        expect(result).toEqual({ type: 'VarDeclaration', idents: ['x'], varType: 'integer' });
    });

    test('parseVarDeclaration reconhece múltiplos identificadores', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'var', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 5 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 6 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 7 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 8 },
            { type: 'KEYWORD', value: 'boolean', line: 1, column: 9 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 16 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseVarDeclaration();
        expect(result).toEqual({ type: 'VarDeclaration', idents: ['x', 'y'], varType: 'boolean' });
    });

    test('parseVarDeclaration lança erro se não começa com var', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarDeclaration()).toThrow(/Esperado 'var' no início da declaração de variável/);
    });

    test('parseVarDeclaration lança erro se faltar identificador', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'var', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarDeclaration()).toThrow(/Esperado identificador em declaração de variável/);
    });

    test('parseVarDeclaration lança erro se faltar :', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'var', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarDeclaration()).toThrow(/Esperado ':' após lista de identificadores/);
    });

    test('parseVarDeclaration lança erro se faltar tipo', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'var', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 2 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarDeclaration()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });

    test('parseVarDeclaration lança erro se faltar ;', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'var', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 2 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 3 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseVarDeclaration()).toThrow(/Esperado ';' ao final da declaração de variável/);
    });
});

describe('TinyPascalParser - parseParam', () => {
    test('parseParam reconhece um identificador', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseParam();
        expect(result).toEqual({ type: 'Param', idents: ['x'], paramType: 'integer' });
    });

    test('parseParam reconhece múltiplos identificadores', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 4 },
            { type: 'KEYWORD', value: 'boolean', line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseParam();
        expect(result).toEqual({ type: 'Param', idents: ['x', 'y'], paramType: 'boolean' });
    });

    test('parseParam lança erro se faltar identificador', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: ':', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParam()).toThrow(/Esperado identificador em declaração de variável/);
    });

    test('parseParam lança erro se faltar dois pontos', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParam()).toThrow(/Esperado ':' após lista de identificadores do parâmetro/);
    });

    test('parseParam lança erro se faltar tipo', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParam()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });
});

describe('TinyPascalParser - parseParamList', () => {
    test('parseParamList reconhece um parâmetro', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseParamList();
        expect(result).toEqual([
            { type: 'Param', idents: ['x'], paramType: 'integer' }
        ]);
    });

    test('parseParamList reconhece múltiplos parâmetros', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 5 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 6 },
            { type: 'KEYWORD', value: 'boolean', line: 1, column: 7 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseParamList();
        expect(result).toEqual([
            { type: 'Param', idents: ['x'], paramType: 'integer' },
            { type: 'Param', idents: ['y'], paramType: 'boolean' }
        ]);
    });

    test('parseParamList lança erro se faltar identificador no segundo parâmetro', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 5 },
            { type: 'KEYWORD', value: 'boolean', line: 1, column: 6 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado identificador em declaração de variável/);
    });

    test('parseParamList lança erro se faltar dois pontos no segundo parâmetro', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 5 },
            { type: 'KEYWORD', value: 'boolean', line: 1, column: 6 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado ':' após lista de identificadores do parâmetro/);
    });

    test('parseParamList lança erro se faltar tipo no segundo parâmetro', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'integer', line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 5 },
            { type: 'PUNCTUATION', value: ':', line: 1, column: 6 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });
});

