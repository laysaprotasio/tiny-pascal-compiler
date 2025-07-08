const fs = require('fs');
const path = require('path');
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
<<<<<<< HEAD

  x := 3;

  while x > 0 do
    if x = 2 then
      continue
    else if x = 1 then
      break
    else
      x := x - 1;

  writeln(x);

  return x + y;
  return true;
  return soma(x,y)

=======
>>>>>>> d6b1186f33d134b5c99dc037e58e45fcff97f785
`;

const lexer = new TinyPascalLexer(exampleCode);
const tokens = lexer.tokenize();

const parser = new TinyPascalParser(tokens);
const result = parser.parseStmtList();

console.dir(result, { depth: null });
