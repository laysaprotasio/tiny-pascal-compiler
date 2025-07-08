const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('./parser');

const exampleCode = `
  x := 10;
  y := 20;
  msg := true;
  if x < y then
    x := soma(x, y)
  else
    x := 0;
  imprimeResultado();
`;

const lexer = new TinyPascalLexer(exampleCode);
const tokens = lexer.tokenize();

const parser = new TinyPascalParser(tokens);
const result = parser.parseStmtList();

console.dir(result, { depth: null });
