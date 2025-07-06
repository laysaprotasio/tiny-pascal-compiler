const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('./lexer');

const examplePath = path.resolve(__dirname, '../../example.tp');
const code = fs.readFileSync(examplePath, 'utf-8');

const lexer = new TinyPascalLexer(code);
const tokens = lexer.tokenize();

console.log(tokens);
console.log(lexer.symbolTable);
