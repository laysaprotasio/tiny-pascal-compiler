const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('./lexer');

const examplePath = path.resolve(__dirname, '../../example.tp');
const code = fs.readFileSync(examplePath, 'utf-8');

const lexer = new TinyPascalLexer(code);
const tokens = lexer.tokenize();

tokens.forEach(token => {
  console.log(`[${token.type}] (${token.line},${token.column}): ${token.value}`);
});
