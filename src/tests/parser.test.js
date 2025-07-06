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

describe('TinyPascalParser - parseProgram', () => {
    test('parseProgram com programa válido', () => {
        const tokens = [
            { type: TokenType.IDENTIFIER, value: 'x', line: 1, column: 1 },
            { type: TokenType.KEYWORD, value: 'begin', line: 2, column: 1 },
            { type: TokenType.NUMBER, value: 1, line: 2, column: 7 },
            { type: TokenType.KEYWORD, value: 'end', line: 3, column: 1 },
            { type: TokenType.PUNCTUATION, value: '.', line: 3, column: 4 },
            { type: TokenType.EOF, value: null, line: 3, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseProgram();
        expect(result.type).toBe('Program');
        expect(result.globalDeclarations.type).toBe('GlobalDeclarations');
        expect(result.block.type).toBe('Block');
    });

    test('parseProgram erro: falta ponto final', () => {
        const tokens = [
            { type: TokenType.IDENTIFIER, value: 'x', line: 1, column: 1 },
            { type: TokenType.KEYWORD, value: 'begin', line: 2, column: 1 },
            { type: TokenType.NUMBER, value: 1, line: 2, column: 7 },
            { type: TokenType.KEYWORD, value: 'end', line: 3, column: 1 },
            { type: TokenType.EOF, value: null, line: 3, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProgram()).toThrow(/Esperado '\.' ao final do programa/);
    });
});

describe('TinyPascalParser - parseGlobalDeclarations', () => {
    test('parseGlobalDeclarations com declarações', () => {
        const tokens = [
            { type: TokenType.IDENTIFIER, value: 'x', line: 1, column: 1 },
            { type: TokenType.KEYWORD, value: 'begin', line: 2, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseGlobalDeclarations();
        expect(result.type).toBe('GlobalDeclarations');
        expect(result.declarations.length).toBe(1);
        expect(result.declarations[0].value).toBe('x');
    });

    test('parseGlobalDeclarations erro: falta begin', () => {
        const tokens = [
            { type: TokenType.IDENTIFIER, value: 'x', line: 1, column: 1 },
            { type: TokenType.EOF, value: null, line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseGlobalDeclarations()).toThrow(/Esperado 'begin' no início do bloco/);
    });
});

describe('TinyPascalParser - parseBlock', () => {
    test('parseBlock com bloco válido', () => {
        const tokens = [
            { type: TokenType.KEYWORD, value: 'begin', line: 1, column: 1 },
            { type: TokenType.NUMBER, value: 1, line: 1, column: 7 },
            { type: TokenType.KEYWORD, value: 'end', line: 2, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseBlock();
        expect(result.type).toBe('Block');
        expect(result.blockTokens[0].value).toBe('begin');
        expect(result.blockTokens[result.blockTokens.length - 1].value).toBe('end');
    });

    test('parseBlock erro: falta begin', () => {
        const tokens = [
            { type: TokenType.NUMBER, value: 1, line: 1, column: 1 },
            { type: TokenType.KEYWORD, value: 'end', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Esperado 'begin' no início do bloco/);
    });

    test('parseBlock erro: falta end', () => {
        const tokens = [
            { type: TokenType.KEYWORD, value: 'begin', line: 1, column: 1 },
            { type: TokenType.NUMBER, value: 1, line: 1, column: 7 },
            { type: TokenType.EOF, value: null, line: 2, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Esperado 'end' ao final do bloco/);
    });
});

describe('TinyPascalParser - parseProgram (cenários extras)', () => {
    test('parseProgram erro: token inesperado no lugar do ponto final', () => {
        const tokens = [
            { type: TokenType.IDENTIFIER, value: 'x', line: 1, column: 1 },
            { type: TokenType.KEYWORD, value: 'begin', line: 2, column: 1 },
            { type: TokenType.NUMBER, value: 1, line: 2, column: 7 },
            { type: TokenType.KEYWORD, value: 'end', line: 3, column: 1 },
            { type: TokenType.PUNCTUATION, value: ';', line: 3, column: 4 }, // deveria ser ponto final
            { type: TokenType.EOF, value: null, line: 3, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProgram()).toThrow(/Esperado '\.' ao final do programa/);
    });
});

describe('TinyPascalParser - parseGlobalDeclarations (cenários extras)', () => {
    test('parseGlobalDeclarations com múltiplas declarações', () => {
        const tokens = [
            { type: TokenType.IDENTIFIER, value: 'x', line: 1, column: 1 },
            { type: TokenType.IDENTIFIER, value: 'y', line: 1, column: 3 },
            { type: TokenType.IDENTIFIER, value: 'z', line: 1, column: 5 },
            { type: TokenType.KEYWORD, value: 'begin', line: 2, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseGlobalDeclarations();
        expect(result.declarations.length).toBe(3);
        expect(result.declarations.map(d => d.value)).toEqual(['x', 'y', 'z']);
    });

    test('parseGlobalDeclarations erro: primeiro token já é begin', () => {
        const tokens = [
            { type: TokenType.KEYWORD, value: 'begin', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseGlobalDeclarations();
        expect(result.declarations.length).toBe(0);
    });
});

describe('TinyPascalParser - parseBlock (cenários extras)', () => {
    test('parseBlock com bloco vazio', () => {
        const tokens = [
            { type: TokenType.KEYWORD, value: 'begin', line: 1, column: 1 },
            { type: TokenType.KEYWORD, value: 'end', line: 1, column: 7 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseBlock();
        expect(result.blockTokens.length).toBe(2);
        expect(result.blockTokens[0].value).toBe('begin');
        expect(result.blockTokens[1].value).toBe('end');
    });

    test('parseBlock erro: bloco termina com token inesperado', () => {
        const tokens = [
            { type: TokenType.KEYWORD, value: 'begin', line: 1, column: 1 },
            { type: TokenType.NUMBER, value: 1, line: 1, column: 7 },
            { type: TokenType.PUNCTUATION, value: ';', line: 2, column: 1 }, // era esperado 'end'
            { type: TokenType.EOF, value: null, line: 2, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Esperado 'end' ao final do bloco/);
    });

    test('parseBlock erro: bloco vazio sem end', () => {
        const tokens = [
            { type: TokenType.KEYWORD, value: 'begin', line: 1, column: 1 },
            { type: TokenType.EOF, value: null, line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Esperado 'end' ao final do bloco/);
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

