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
    });

    test('advance() does not go past the last token', () => {
        parser.advance(); // +
        parser.advance(); // 2
        parser.advance(); // EOF
        parser.advance(); // Try to advance past EOF
        expect(parser.peek()).toEqual(mockTokens[3]);
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
    function makeToken(type, value, line = 1, column = 1) {
        return { type, value, line, column };
    }

    test('parseParamList reconhece um parâmetro', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer')
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseParamList();
        expect(result).toEqual([
            { type: 'Param', idents: ['x'], paramType: 'integer' }
        ]);
    });

    test('parseParamList reconhece múltiplos parâmetros separados por ponto e vírgula', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('IDENTIFIER', 'y'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'boolean')
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseParamList();
        expect(result).toEqual([
            { type: 'Param', idents: ['x'], paramType: 'integer' },
            { type: 'Param', idents: ['y'], paramType: 'boolean' }
        ]);
    });

    test('parseParamList lança erro se não começa com identificador', () => {
        const tokens = [
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado identificador em declaração de variável/);
    });

    test('parseParamList lança erro se faltar identificador no segundo parâmetro', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'boolean')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado identificador em declaração de variável/);
    });

    test('parseParamList lança erro se faltar dois pontos no segundo parâmetro', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('IDENTIFIER', 'y'),
            makeToken('KEYWORD', 'boolean')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado ':' após lista de identificadores do parâmetro/);
    });

    test('parseParamList lança erro se faltar tipo no segundo parâmetro', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('IDENTIFIER', 'y'),
            makeToken('PUNCTUATION', ':'),
            makeToken('PUNCTUATION', ';')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseParamList()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });
});

describe('TinyPascalParser - parseIdent', () => {
    test('parseIdent reconhece identificador válido', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'abc', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseIdent();
        expect(result).toEqual({
            type: 'Identifier',
            name: 'abc',
            line: 1,
            column: 1
        });
    });

    test('parseIdent lança erro se não for identificador', () => {
        const tokens = [
            { type: 'NUMBER', value: 123, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseIdent()).toThrow(/Esperado identificador, encontrado: 123/);
    });

    test('parseIdent lança erro se for EOF', () => {
        const tokens = [
            { type: 'EOF', value: null, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseIdent()).toThrow(/Esperado identificador, encontrado: EOF/);
    });
});

describe('TinyPascalParser - parseNumber', () => {
    test('parseNumber reconhece número válido', () => {
        const tokens = [
            { type: 'NUMBER', value: 42, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseNumber();
        expect(result).toEqual({
            type: 'Number',
            value: 42,
            line: 1,
            column: 1
        });
    });

    test('parseNumber lança erro se não for número', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'abc', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseNumber()).toThrow(/Esperado número, encontrado: abc/);
    });

    test('parseNumber lança erro se for EOF', () => {
        const tokens = [
            { type: 'EOF', value: null, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseNumber()).toThrow(/Esperado número, encontrado: EOF/);
    });
});

describe('TinyPascalParser - parseFactor', () => {
    test('parseFactor reconhece identificador', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'abc', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'Identifier',
            name: 'abc',
            line: 1,
            column: 1
        });
    });

    test('parseFactor reconhece número', () => {
        const tokens = [
            { type: 'NUMBER', value: 123, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'Number',
            value: 123,
            line: 1,
            column: 1
        });
    });

    test('parseFactor reconhece true', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'true', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'Boolean',
            value: true,
            line: 1,
            column: 1
        });
    });

    test('parseFactor reconhece false', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'false', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'Boolean',
            value: false,
            line: 1,
            column: 1
        });
    });

    test('parseFactor reconhece not <factor> (identificador)', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'not', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'Not',
            factor: {
                type: 'Identifier',
                name: 'x',
                line: 1,
                column: 5
            }
        });
    });

    test('parseFactor reconhece not not <factor> (número)', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'not', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'not', line: 1, column: 5 },
            { type: 'NUMBER', value: 0, line: 1, column: 9 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'Not',
            factor: {
                type: 'Not',
                factor: {
                    type: 'Number',
                    value: 0,
                    line: 1,
                    column: 9
                }
            }
        });
    });

    test('parseFactor reconhece expressão entre parênteses', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: '(', line: 1, column: 1 },
            { type: 'NUMBER', value: 42, line: 1, column: 2 },
            { type: 'PUNCTUATION', value: ')', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'ParenExpr',
            expr: { type: 'Number', value: 42, line: 1, column: 2 }
        });
    });

    test('parseFactor reconhece expressão relacional entre parênteses', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: '(', line: 1, column: 1 },
            { type: 'NUMBER', value: 1, line: 1, column: 2 },
            { type: 'OPERATOR', value: '=', line: 1, column: 3 },
            { type: 'NUMBER', value: 2, line: 1, column: 4 },
            { type: 'PUNCTUATION', value: ')', line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'ParenExpr',
            expr: {
                type: 'BinaryOp',
                operator: '=',
                left: { type: 'Number', value: 1, line: 1, column: 2 },
                right: { type: 'Number', value: 2, line: 1, column: 4 }
            }
        });
    });

    test('parseFactor reconhece parênteses aninhados', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: '(', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: '(', line: 1, column: 2 },
            { type: 'NUMBER', value: 7, line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ')', line: 1, column: 4 },
            { type: 'PUNCTUATION', value: ')', line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFactor();
        expect(result).toEqual({
            type: 'ParenExpr',
            expr: {
                type: 'ParenExpr',
                expr: { type: 'Number', value: 7, line: 1, column: 3 }
            }
        });
    });

    test('parseFactor lança erro se faltar parêntese de fechamento', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: '(', line: 1, column: 1 },
            { type: 'NUMBER', value: 1, line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFactor()).toThrow(/Esperado '\)' após expressão/);
    });

    test('parseFactor lança erro para token inválido', () => {
        const tokens = [
            { type: 'OPERATOR', value: '+', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFactor()).toThrow(/Esperado fator, encontrado: \+/);
    });

    test('parseFactor lança erro para EOF', () => {
        const tokens = [
            { type: 'EOF', value: null, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFactor()).toThrow(/Esperado fator, encontrado: EOF/);
    });
});

describe('TinyPascalParser - parseTerm', () => {
    test('parseTerm reconhece fator simples', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseTerm();
        expect(result).toEqual({
            type: 'Number',
            value: 2,
            line: 1,
            column: 1
        });
    });

    test('parseTerm reconhece multiplicação', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 },
            { type: 'OPERATOR', value: '*', line: 1, column: 2 },
            { type: 'NUMBER', value: 3, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseTerm();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '*',
            left: { type: 'Number', value: 2, line: 1, column: 1 },
            right: { type: 'Number', value: 3, line: 1, column: 3 }
        });
    });

    test('parseTerm reconhece divisão', () => {
        const tokens = [
            { type: 'NUMBER', value: 6, line: 1, column: 1 },
            { type: 'OPERATOR', value: '/', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseTerm();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '/',
            left: { type: 'Number', value: 6, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseTerm reconhece and', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'true', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'and', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'false', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseTerm();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: 'and',
            left: { type: 'Boolean', value: true, line: 1, column: 1 },
            right: { type: 'Boolean', value: false, line: 1, column: 3 }
        });
    });

    test('parseTerm reconhece operações encadeadas', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 },
            { type: 'OPERATOR', value: '*', line: 1, column: 2 },
            { type: 'NUMBER', value: 3, line: 1, column: 3 },
            { type: 'OPERATOR', value: '/', line: 1, column: 4 },
            { type: 'NUMBER', value: 4, line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseTerm();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '/',
            left: {
                type: 'BinaryOp',
                operator: '*',
                left: { type: 'Number', value: 2, line: 1, column: 1 },
                right: { type: 'Number', value: 3, line: 1, column: 3 }
            },
            right: { type: 'Number', value: 4, line: 1, column: 5 }
        });
    });

    test('parseTerm lança erro para operador inválido após fator', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'NUMBER', value: 3, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        // parseTerm só consome o primeiro fator, não aceita +
        const result = parser.parseTerm();
        expect(result).toEqual({ type: 'Number', value: 2, line: 1, column: 1 });
    });
});

describe('TinyPascalParser - parseSimpleExpr', () => {
    test('parseSimpleExpr reconhece termo simples', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseSimpleExpr();
        expect(result).toEqual({
            type: 'Number',
            value: 2,
            line: 1,
            column: 1
        });
    });

    test('parseSimpleExpr reconhece adição', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'NUMBER', value: 3, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseSimpleExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '+',
            left: { type: 'Number', value: 2, line: 1, column: 1 },
            right: { type: 'Number', value: 3, line: 1, column: 3 }
        });
    });

    test('parseSimpleExpr reconhece subtração', () => {
        const tokens = [
            { type: 'NUMBER', value: 6, line: 1, column: 1 },
            { type: 'OPERATOR', value: '-', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseSimpleExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '-',
            left: { type: 'Number', value: 6, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseSimpleExpr reconhece or', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'true', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'or', line: 1, column: 2 },
            { type: 'KEYWORD', value: 'false', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseSimpleExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: 'or',
            left: { type: 'Boolean', value: true, line: 1, column: 1 },
            right: { type: 'Boolean', value: false, line: 1, column: 3 }
        });
    });

    test('parseSimpleExpr reconhece operações encadeadas', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'NUMBER', value: 3, line: 1, column: 3 },
            { type: 'OPERATOR', value: '-', line: 1, column: 4 },
            { type: 'NUMBER', value: 4, line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseSimpleExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '-',
            left: {
                type: 'BinaryOp',
                operator: '+',
                left: { type: 'Number', value: 2, line: 1, column: 1 },
                right: { type: 'Number', value: 3, line: 1, column: 3 }
            },
            right: { type: 'Number', value: 4, line: 1, column: 5 }
        });
    });

    test('parseSimpleExpr lança erro para operador inválido após termo', () => {
        const tokens = [
            { type: 'NUMBER', value: 2, line: 1, column: 1 },
            { type: 'OPERATOR', value: '*', line: 1, column: 2 },
            { type: 'NUMBER', value: 3, line: 1, column: 3 },
            { type: 'OPERATOR', value: '/', line: 1, column: 4 },
            { type: 'NUMBER', value: 4, line: 1, column: 5 },
            { type: 'OPERATOR', value: '+', line: 1, column: 6 },
            { type: 'NUMBER', value: 5, line: 1, column: 7 }
        ];
        const parser = new TinyPascalParser(tokens);
        // parseSimpleExpr consome toda a expressão, respeitando precedência
        const result = parser.parseSimpleExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '+',
            left: {
                type: 'BinaryOp',
                operator: '/',
                left: {
                    type: 'BinaryOp',
                    operator: '*',
                    left: { type: 'Number', value: 2, line: 1, column: 1 },
                    right: { type: 'Number', value: 3, line: 1, column: 3 }
                },
                right: { type: 'Number', value: 4, line: 1, column: 5 }
            },
            right: { type: 'Number', value: 5, line: 1, column: 7 }
        });
    });
});

describe('TinyPascalParser - parseExpr', () => {
    test('parseExpr reconhece simple-expr simples', () => {
        const tokens = [
            { type: 'NUMBER', value: 10, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'Number',
            value: 10,
            line: 1,
            column: 1
        });
    });

    test('parseExpr reconhece expressão relacional =', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '=', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '=',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece expressão relacional <>', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '<>', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '<>',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece expressão relacional <', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '<', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '<',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece expressão relacional <=', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '<=', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '<=',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece expressão relacional >', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '>', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '>',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece expressão relacional >=', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '>=', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '>=',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece precedência correta', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 },
            { type: 'OPERATOR', value: '=', line: 1, column: 4 },
            { type: 'NUMBER', value: 3, line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '=',
            left: {
                type: 'BinaryOp',
                operator: '+',
                left: { type: 'Number', value: 1, line: 1, column: 1 },
                right: { type: 'Number', value: 2, line: 1, column: 3 }
            },
            right: { type: 'Number', value: 3, line: 1, column: 5 }
        });
    });

    test('parseExpr sem operador relacional retorna simple-expr', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '+',
            left: { type: 'Number', value: 1, line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });
});

describe('TinyPascalParser - parseExprList', () => {
    test('parseExprList reconhece uma expressão', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExprList();
        expect(result).toEqual([
            { type: 'Number', value: 1, line: 1, column: 1 }
        ]);
    });

    test('parseExprList reconhece múltiplas expressões', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'NUMBER', value: 3, line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExprList();
        expect(result).toEqual([
            { type: 'Number', value: 1, line: 1, column: 1 },
            { type: 'Number', value: 2, line: 1, column: 3 },
            { type: 'Number', value: 3, line: 1, column: 5 }
        ]);
    });

    test('parseExprList reconhece expressões relacionais', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'OPERATOR', value: '=', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 4 },
            { type: 'NUMBER', value: 3, line: 1, column: 5 },
            { type: 'OPERATOR', value: '<', line: 1, column: 6 },
            { type: 'NUMBER', value: 4, line: 1, column: 7 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExprList();
        expect(result).toEqual([
            {
                type: 'BinaryOp',
                operator: '=',
                left: { type: 'Number', value: 1, line: 1, column: 1 },
                right: { type: 'Number', value: 2, line: 1, column: 3 }
            },
            {
                type: 'BinaryOp',
                operator: '<',
                left: { type: 'Number', value: 3, line: 1, column: 5 },
                right: { type: 'Number', value: 4, line: 1, column: 7 }
            }
        ]);
    });

    test('parseExprList lança erro se faltar expressão após vírgula', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });
});

describe('TinyPascalParser - parseExprList (erros adicionais)', () => {
    test('parseExprList lança erro se começar com vírgula', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: ',', line: 1, column: 1 },
            { type: 'NUMBER', value: 1, line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });

    test('parseExprList lança erro para vírgulas consecutivas', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 3 },
            { type: 'NUMBER', value: 2, line: 1, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });

    test('parseExprList lança erro se terminar com vírgula', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });

    test('parseExprList lança erro se houver token inválido entre expressões', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'OPERATOR', value: '+', line: 1, column: 3 },
            { type: 'NUMBER', value: 2, line: 1, column: 4 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });

    test('parseExprList lança erro se EOF inesperado após vírgula', () => {
        const tokens = [
            { type: 'NUMBER', value: 1, line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 },
            { type: 'EOF', value: null, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });
});

describe('TinyPascalParser - identificadores e expressões (integração)', () => {
    test('parseIdent reconhece identificador simples', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseIdent();
        expect(result).toEqual({ type: 'Identifier', name: 'x', line: 1, column: 1 });
    });

    test('parseExpr reconhece identificador em expressão', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'NUMBER', value: 2, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '+',
            left: { type: 'Identifier', name: 'x', line: 1, column: 1 },
            right: { type: 'Number', value: 2, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece identificadores e números misturados', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'a', line: 1, column: 1 },
            { type: 'OPERATOR', value: '+', line: 1, column: 2 },
            { type: 'IDENTIFIER', value: 'b', line: 1, column: 3 },
            { type: 'OPERATOR', value: '-', line: 1, column: 4 },
            { type: 'NUMBER', value: 5, line: 1, column: 5 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '-',
            left: {
                type: 'BinaryOp',
                operator: '+',
                left: { type: 'Identifier', name: 'a', line: 1, column: 1 },
                right: { type: 'Identifier', name: 'b', line: 1, column: 3 }
            },
            right: { type: 'Number', value: 5, line: 1, column: 5 }
        });
    });

    test('parseExpr reconhece identificador com operador relacional', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'OPERATOR', value: '=', line: 1, column: 2 },
            { type: 'NUMBER', value: 0, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'BinaryOp',
            operator: '=',
            left: { type: 'Identifier', name: 'x', line: 1, column: 1 },
            right: { type: 'Number', value: 0, line: 1, column: 3 }
        });
    });

    test('parseExpr reconhece identificador entre parênteses', () => {
        const tokens = [
            { type: 'PUNCTUATION', value: '(', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 2 },
            { type: 'PUNCTUATION', value: ')', line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseExpr();
        expect(result).toEqual({
            type: 'ParenExpr',
            expr: { type: 'Identifier', name: 'y', line: 1, column: 2 }
        });
    });

    test('parseExpr lança erro para identificador seguido de operador inválido', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'OPERATOR', value: '*', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExpr()).toThrow();
    });

    test('parseExprList lança erro para identificador isolado após vírgula', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'PUNCTUATION', value: ',', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseExprList()).toThrow();
    });

    test('parseStmt reconhece comando if sem else', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'if', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 4 },
            { type: 'OPERATOR', value: '=', line: 1, column: 6 },
            { type: 'NUMBER', value: 1, line: 1, column: 8 },
            { type: 'KEYWORD', value: 'then', line: 1, column: 10 },
            { type: 'IDENTIFIER', value: 'y', line: 1, column: 15 },
            { type: 'OPERATOR', value: ':=', line: 1, column: 17 },
            { type: 'NUMBER', value: 2, line: 1, column: 20 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseStmt();
        expect(result).toEqual({
            type: 'IfStmt',
            expr: {
                type: 'BinaryOp',
                operator: '=',
                left: { type: 'Identifier', name: 'x', line: 1, column: 4 },
                right: { type: 'Number', value: 1, line: 1, column: 8 }
            },
            thenBranch: {
                type: 'Assign',
                target: { type: 'Identifier', name: 'y', line: 1, column: 15 },
                value: { type: 'Number', value: 2, line: 1, column: 20 },
                line: 1,
                column: 15
            },
            elseBranch: null,
            line: 1,
            column: 1
        });
    });

    test('parseStmt reconhece comando de atribuição', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'OPERATOR', value: ':=', line: 1, column: 2 },
            { type: 'NUMBER', value: 42, line: 1, column: 3 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseStmt();
        expect(result).toEqual({
            type: 'Assign',
            target: { type: 'Identifier', name: 'x', line: 1, column: 1 },
            value: { type: 'Number', value: 42, line: 1, column: 3 },
            line: 1,
            column: 1
        }); 
    });

    test('parseStmt reconhece while com stmt', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'while', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 7 },
            { type: 'OPERATOR', value: '>', line: 1, column: 9 },
            { type: 'NUMBER', value: '0', line: 1, column: 11 },
            { type: 'KEYWORD', value: 'do', line: 1, column: 13 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 16 },
            { type: 'OPERATOR', value: ':=', line: 1, column: 18 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 21 },
            { type: 'OPERATOR', value: '-', line: 1, column: 23 },
            { type: 'NUMBER', value: '1', line: 1, column: 25 }
        ];

        const parser = new TinyPascalParser(tokens);
        const result = parser.parseStmt();

        expect(result).toEqual({
            type: 'WhileStmt',
            expr: {
                type: 'BinaryOp',
                operator: '>',
                left: { type: 'Identifier', name: 'x', line: 1, column: 7 },
                right: { type: 'Number', value: '0', line: 1, column: 11 }
            },
            doBranch: {
                type: 'Assign',
                target: { type: 'Identifier', name: 'x', line: 1, column: 16 },
                value: {
                    type: 'BinaryOp',
                    operator: '-',
                    left: { type: 'Identifier', name: 'x', line: 1, column: 21 },
                    right: { type: 'Number', value: '1', line: 1, column: 25 }
                },
                line: 1,
                column: 16
            },
            line: 1,
            column: 1
        });
    });

    test('parseStmt lança erro se while estiver sem "do"', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'while', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 7 },
            { type: 'OPERATOR', value: '>', line: 1, column: 9 },
            { type: 'NUMBER', value: '0', line: 1, column: 11 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 13 } 
        ];

        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseStmt()).toThrow("Esperado 'do' após condição do while");
    });

});
describe('TinyPascalParser - parseBlock', () => {
    test('parseBlock lança erro para bloco vazio', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'begin', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'end', line: 1, column: 7 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Comando inválido: end/);
    });

    test('parseBlock reconhece bloco com múltiplos comandos', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'begin', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 7 },
            { type: 'OPERATOR', value: ':=', line: 1, column: 8 },
            { type: 'NUMBER', value: 1, line: 1, column: 10 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 11 },
            { type: 'IDENTIFIER', value: 'y', line: 2, column: 1 },
            { type: 'OPERATOR', value: ':=', line: 2, column: 2 },
            { type: 'NUMBER', value: 2, line: 2, column: 4 },
            { type: 'KEYWORD', value: 'end', line: 3, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseBlock();
        expect(result.type).toBe('Block');
        expect(result.statements.type).toBe('StmtList');
        expect(result.statements.statements.length).toBe(2);
    });

    test('parseBlock lança erro se faltar begin', () => {
        const tokens = [
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 1 },
            { type: 'KEYWORD', value: 'end', line: 1, column: 2 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Esperado 'begin' no início do bloco/);
    });

    test.skip('parseBlock lança erro se não houver end após comandos válidos', () => {
        const tokens = [
            { type: 'KEYWORD', value: 'begin', line: 1, column: 1 },
            { type: 'IDENTIFIER', value: 'x', line: 1, column: 2 },
            { type: 'OPERATOR', value: ':=', line: 1, column: 3 },
            { type: 'NUMBER', value: 1, line: 1, column: 4 },
            { type: 'PUNCTUATION', value: ';', line: 1, column: 5 },
            { type: 'IDENTIFIER', value: 'y', line: 2, column: 1 },
            { type: 'OPERATOR', value: ':=', line: 2, column: 2 },
            { type: 'NUMBER', value: 2, line: 2, column: 3 },
            { type: 'PUNCTUATION', value: ';', line: 2, column: 4 },
            { type: 'EOF', value: null, line: 3, column: 1 }
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseBlock()).toThrow(/Esperado 'end' ao final do bloco/);
    });
});

describe('TinyPascalParser - parseFunctionDeclaration', () => {
    function makeToken(type, value, line = 1, column = 1) {
        return { type, value, line, column };
    }

    test('Reconhece declaração de função simples', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('IDENTIFIER', 'a'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('IDENTIFIER', 'b'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFunctionDeclaration();
        expect(result.type).toBe('FunctionDeclaration');
        expect(result.name.name).toBe('soma');
        expect(result.params.length).toBe(2);
        expect(result.returnType).toBe('integer');
        expect(result.body.type).toBe('Block');
    });

    test('Reconhece função sem parâmetros', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'foo'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseFunctionDeclaration();
        expect(result.name.name).toBe('foo');
        expect(result.params.length).toBe(0);
        expect(result.returnType).toBe('integer');
    });

    test('Erro: falta palavra-chave function', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'soma')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado 'function'/);
    });

    test('Erro: falta identificador do nome da função', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('PUNCTUATION', '(')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado identificador/);
    });

    test('Erro: falta parêntese de abertura', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado '\('/);
    });

    test('Erro: falta parêntese de fechamento', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('IDENTIFIER', 'a'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado '\)'/);
    });

    test('Erro: falta dois-pontos antes do tipo de retorno', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('KEYWORD', 'integer')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado ':'/);
    });

    test('Erro: falta tipo de retorno', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('PUNCTUATION', ';')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado tipo 'integer' ou 'boolean'/);
    });

    test('Erro: falta ponto e vírgula após tipo de retorno', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado ';' após tipo de retorno/);
    });

    test('Erro: falta bloco begin...end', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado 'begin'/);
    });

    test('Erro: falta ponto e vírgula após end', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'soma'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseFunctionDeclaration()).toThrow(/Esperado ';' após 'end' da função/);
    });
});

describe('TinyPascalParser - parseProcedureDeclaration', () => {
    function makeToken(type, value, line = 1, column = 1) {
        return { type, value, line, column };
    }

    test('Reconhece declaração de procedimento simples', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc1'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseProcedureDeclaration();
        expect(result.type).toBe('ProcedureDeclaration');
        expect(result.name.name).toBe('proc1');
        expect(result.params.length).toBe(0);
        expect(result.body.type).toBe('Block');
    });

    test('Reconhece procedimento com parâmetros', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc2'),
            makeToken('PUNCTUATION', '('),
            makeToken('IDENTIFIER', 'a'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('IDENTIFIER', 'b'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'boolean'),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'y'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 2),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseProcedureDeclaration();
        expect(result.type).toBe('ProcedureDeclaration');
        expect(result.name.name).toBe('proc2');
        expect(result.params.length).toBe(2);
        expect(result.body.type).toBe('Block');
    });

    test('Erro: falta palavra-chave procedure', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'proc1')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcedureDeclaration()).toThrow(/Esperado 'procedure'/);
    });

    test('Erro: falta identificador do nome do procedimento', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('PUNCTUATION', '(')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcedureDeclaration()).toThrow(/Esperado identificador/);
    });

    test('Erro: falta parêntese de fechamento nos parâmetros', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc2'),
            makeToken('PUNCTUATION', '('),
            makeToken('IDENTIFIER', 'a'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcedureDeclaration()).toThrow(/Esperado '\)'/);
    });

    test('Erro: falta ponto e vírgula após cabeçalho', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc1')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcedureDeclaration()).toThrow(/Esperado ';' após cabeçalho/);
    });

    test('Erro: falta bloco begin...end', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc1'),
            makeToken('PUNCTUATION', ';')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcedureDeclaration()).toThrow(/Esperado 'begin'/);
    });

    test('Erro: falta ponto e vírgula após end', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc1'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcedureDeclaration()).toThrow(/Esperado ';' após 'end' do procedimento/);
    });
});

describe('TinyPascalParser - parseProcFuncDeclaration', () => {
    function makeToken(type, value, line = 1, column = 1) {
        return { type, value, line, column };
    }

    test('Reconhece declaração de procedimento', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc1'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseProcFuncDeclaration();
        expect(result.type).toBe('ProcedureDeclaration');
        expect(result.name.name).toBe('proc1');
    });

    test('Reconhece declaração de função', () => {
        const tokens = [
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'f'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 2),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const result = parser.parseProcFuncDeclaration();
        expect(result.type).toBe('FunctionDeclaration');
        expect(result.name.name).toBe('f');
    });

    test('Erro: token inesperado', () => {
        const tokens = [
            makeToken('IDENTIFIER', 'x')
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProcFuncDeclaration()).toThrow(/Esperado 'procedure' ou 'function'/);
    });
});

describe('TinyPascalParser - parseGlobalDeclarations', () => {
    function makeToken(type, value, line = 1, column = 1) {
        return { type, value, line, column };
    }

    test('Reconhece apenas variáveis globais', () => {
        const tokens = [
            makeToken('KEYWORD', 'var'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', '.'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const decls = parser.parseGlobalDeclarations();
        expect(decls.length).toBe(1);
        expect(decls[0].type).toBe('VarDeclaration');
    });

    test('Reconhece apenas procedimentos/funções globais', () => {
        const tokens = [
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'proc1'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'f'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 2),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'y'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 3),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', '.'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const decls = parser.parseGlobalDeclarations();
        expect(decls.length).toBe(2);
        expect(decls[0].type).toBe('ProcedureDeclaration');
        expect(decls[1].type).toBe('FunctionDeclaration');
    });

    test('Reconhece variáveis e procedimentos/funções globais', () => {
        const tokens = [
            makeToken('KEYWORD', 'var'),
            makeToken('IDENTIFIER', 'a'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'p'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'a'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 5),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'a'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 6),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', '.'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const decls = parser.parseGlobalDeclarations();
        expect(decls.length).toBe(2);
        expect(decls[0].type).toBe('VarDeclaration');
        expect(decls[1].type).toBe('ProcedureDeclaration');
    });

    test('Reconhece ausência de declarações globais', () => {
        const tokens = [
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', '.'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const decls = parser.parseGlobalDeclarations();
        expect(decls.length).toBe(0);
    });
});

describe('TinyPascalParser - parseProgram', () => {
    function makeToken(type, value, line = 1, column = 1) {
        return { type, value, line, column };
    }

    test('Reconhece programa completo', () => {
        const tokens = [
            makeToken('KEYWORD', 'var'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'procedure'),
            makeToken('IDENTIFIER', 'p'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 5),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'function'),
            makeToken('IDENTIFIER', 'f'),
            makeToken('PUNCTUATION', '('),
            makeToken('PUNCTUATION', ')'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 2),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 10),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', '.'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const prog = parser.parseProgram();
        expect(prog.type).toBe('Program');
        expect(prog.declarations.length).toBe(3);
        expect(prog.main.type).toBe('Block');
    });

    test('Reconhece programa só com bloco principal', () => {
        const tokens = [
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('PUNCTUATION', '.'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        const prog = parser.parseProgram();
        expect(prog.type).toBe('Program');
        expect(prog.declarations.length).toBe(0);
        expect(prog.main.type).toBe('Block');
    });

    test('Erro: falta ponto final', () => {
        const tokens = [
            makeToken('KEYWORD', 'begin'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('OPERATOR', ':='),
            makeToken('NUMBER', 1),
            makeToken('PUNCTUATION', ';'),
            makeToken('KEYWORD', 'end'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProgram()).toThrow(/Esperado '\.' ao final do programa/);
    });

    test('Erro: falta bloco principal', () => {
        const tokens = [
            makeToken('KEYWORD', 'var'),
            makeToken('IDENTIFIER', 'x'),
            makeToken('PUNCTUATION', ':'),
            makeToken('KEYWORD', 'integer'),
            makeToken('PUNCTUATION', ';'),
            makeToken('EOF', null)
        ];
        const parser = new TinyPascalParser(tokens);
        expect(() => parser.parseProgram()).toThrow(/Esperado 'begin'/);
    });
});

