const TinyPascalLexer = require('../lexer/lexer');
const { TokenType } = require('../lexer/tokens');

describe('TinyPascalLexer.readIdentifier', () => {
  function setupLexerWithChar(char) {
    const lexer = new TinyPascalLexer(char);
    lexer.currentChar = char[0];
    return lexer;
  }

  it('should recognize a simple identifier', () => {
    const lexer = setupLexerWithChar('abc123');
    const token = lexer.readIdentifier();
    expect(token.type).toBe(TokenType.IDENTIFIER);
    expect(token.value).toBe('abc123');
    expect(token.column).toBe(1);
  });

  it('should recognize an identifier starting with underscore', () => {
    const lexer = setupLexerWithChar('_varName');
    const token = lexer.readIdentifier();
    expect(token.type).toBe(TokenType.IDENTIFIER);
    expect(token.value).toBe('_varName');
  });

  it('should recognize a keyword as KEYWORD token', () => {
    const lexer = setupLexerWithChar('begin');
    const token = lexer.readIdentifier();
    expect(token.type).toBe(TokenType.KEYWORD);
    expect(token.value).toBe('begin');
  });

  it('should return empty identifier for invalid start char', () => {
    const lexer = setupLexerWithChar('1abc');
    const token = lexer.readIdentifier();
    expect(token.type).toBe(TokenType.IDENTIFIER);
    expect(token.value).toBe('');
  });

  it('should stop at non-identifier character', () => {
    const lexer = setupLexerWithChar('abc!def');
    const token = lexer.readIdentifier();
    expect(token.value).toBe('abc');
    expect(lexer.currentChar).toBe('!');
  });

  it('should set the correct column when identifier does not start at column 1', () => {
    const lexer = new TinyPascalLexer('   foo'); // 3 espaços antes
    // Avança os espaços em branco
    lexer.advance(); // 1º espaço
    lexer.advance(); // 2º espaço
    lexer.advance(); // 3º espaço
    // Agora currentChar é 'f' e coluna é 4
    const token = lexer.readIdentifier();
    expect(token.value).toBe('foo');
    expect(token.column).toBe(4);
  });
});

describe('TinyPascalLexer.getNextToken', () => {
  function getTokenFromInput(input) {
    const lexer = new TinyPascalLexer(input);
    return lexer.getNextToken();
  }

  it('should recognize an identifier', () => {
    const token = getTokenFromInput('abc');
    expect(token.type).toBe(TokenType.IDENTIFIER);
    expect(token.value).toBe('abc');
  });

  it('should recognize a keyword', () => {
    const token = getTokenFromInput('begin');
    expect(token.type).toBe(TokenType.KEYWORD);
    expect(token.value).toBe('begin');
  });

  it('should recognize a number', () => {
    const token = getTokenFromInput('12345');
    expect(token.type).toBe(TokenType.NUMBER);
    expect(token.value).toBe(12345);
  });

  it('should recognize a string with single quotes', () => {
    const token = getTokenFromInput("'hello world'");
    expect(token.type).toBe(TokenType.STRING);
    expect(token.value).toBe('hello world');
  });

  it('should recognize := operator', () => {
    const token = getTokenFromInput(':=');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe(':=');
  });

  it('should recognize <> operator', () => {
    const token = getTokenFromInput('<>');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('<>');
  });

  it('should recognize <= operator', () => {
    const token = getTokenFromInput('<=');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('<=');
  });

  it('should recognize >= operator', () => {
    const token = getTokenFromInput('>=');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('>=');
  });

  it('should recognize = operator', () => {
    const token = getTokenFromInput('=');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('=');
  });

  it('should recognize < operator', () => {
    const token = getTokenFromInput('<');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('<');
  });

  it('should recognize > operator', () => {
    const token = getTokenFromInput('>');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('>');
  });

  it('should recognize + operator', () => {
    const token = getTokenFromInput('+');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('+');
  });

  it('should recognize - operator', () => {
    const token = getTokenFromInput('-');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('-');
  });

  it('should recognize * operator', () => {
    const token = getTokenFromInput('*');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('*');
  });

  it('should recognize / operator', () => {
    const token = getTokenFromInput('/');
    expect(token.type).toBe(TokenType.OPERATOR);
    expect(token.value).toBe('/');
  });

  it('should recognize punctuation ;', () => {
    const token = getTokenFromInput(';');
    expect(token.type).toBe(TokenType.PUNCTUATION);
    expect(token.value).toBe(';');
  });

  it('should recognize punctuation ,', () => {
    const token = getTokenFromInput(',');
    expect(token.type).toBe(TokenType.PUNCTUATION);
    expect(token.value).toBe(',');
  });

  it('should recognize punctuation .', () => {
    const token = getTokenFromInput('.');
    expect(token.type).toBe(TokenType.PUNCTUATION);
    expect(token.value).toBe('.');
  });

  it('should recognize punctuation (', () => {
    const token = getTokenFromInput('(');
    expect(token.type).toBe(TokenType.PUNCTUATION);
    expect(token.value).toBe('(');
  });

  it('should recognize punctuation )', () => {
    const token = getTokenFromInput(')');
    expect(token.type).toBe(TokenType.PUNCTUATION);
    expect(token.value).toBe(')');
  });

  it('should recognize punctuation :', () => {
    const token = getTokenFromInput(':');
    expect(token.type).toBe(TokenType.PUNCTUATION);
    expect(token.value).toBe(':');
  });

  it('should recognize EOF', () => {
    const token = getTokenFromInput('   '); // só espaços
    expect(token.type).toBe(TokenType.EOF);
  });

  it('should recognize unknown character', () => {
    const token = getTokenFromInput('@');
    expect(token.type).toBe('UNKNOWN');
    expect(token.value).toBe('@');
  });
});

describe('TinyPascalLexer.tokenize', () => {
  it('should tokenize a simple variable declaration and assignment', () => {
    const code = `var x: integer; begin x := 10; end.`;
    const lexer = new TinyPascalLexer(code);
    const tokens = lexer.tokenize();
    const types = tokens.map(t => t.type);
    const values = tokens.map(t => t.value);
    expect(types).toEqual([
      TokenType.KEYWORD, TokenType.IDENTIFIER, TokenType.PUNCTUATION, TokenType.KEYWORD, TokenType.PUNCTUATION, TokenType.KEYWORD, TokenType.IDENTIFIER, TokenType.OPERATOR, TokenType.NUMBER, TokenType.PUNCTUATION, TokenType.KEYWORD, TokenType.PUNCTUATION, TokenType.EOF
    ]);
    expect(values).toEqual([
      'var', 'x', ':', 'integer', ';', 'begin', 'x', ':=', 10, ';', 'end', '.', null
    ]);
  });

  it('should tokenize a function declaration and call', () => {
    const code = `function soma(a: integer; b: integer): integer; begin return a + b; end; x := soma(1, 2);`;
    const lexer = new TinyPascalLexer(code);
    const tokens = lexer.tokenize();
    const types = tokens.map(t => t.type);
    expect(types).toContain(TokenType.KEYWORD);
    expect(types).toContain(TokenType.IDENTIFIER);
    expect(types).toContain(TokenType.OPERATOR);
    expect(types).toContain(TokenType.NUMBER);
    expect(types).toContain(TokenType.PUNCTUATION);
    expect(types).toContain(TokenType.EOF);
  });

  it('should tokenize control flow statements', () => {
    const code = `if x < y then x := y else x := 0; while x > 0 do x := x - 1;`;
    const lexer = new TinyPascalLexer(code);
    const tokens = lexer.tokenize();
    const values = tokens.map(t => t.value);
    expect(values).toContain('if');
    expect(values).toContain('then');
    expect(values).toContain('else');
    expect(values).toContain('while');
    expect(values).toContain('do');
    expect(values).toContain('<');
    expect(values).toContain('>');
    expect(values).toContain('-');
  });

  it('should tokenize write and string', () => {
    const code = `writeln('Resultado: ', x);`;
    const lexer = new TinyPascalLexer(code);
    const tokens = lexer.tokenize();
    const values = tokens.map(t => t.value);
    expect(values).toContain('writeln');
    expect(values).toContain('Resultado: ');
    expect(values).toContain(',');
    expect(values).toContain('x');
    expect(values).toContain('(');
    expect(values).toContain(')');
    expect(values).toContain(';');
  });

  it('should return only EOF for empty or whitespace input', () => {
    const lexer = new TinyPascalLexer('    \n\t   ');
    const tokens = lexer.tokenize();
    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
  });

  it('should return UNKNOWN for invalid characters', () => {
    const lexer = new TinyPascalLexer('@#');
    const tokens = lexer.tokenize();
    expect(tokens.some(t => t.type === 'UNKNOWN')).toBe(true);
  });
});
