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
