const TokenType = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  EOF: 'EOF'
};


const Keywords = [
  'var', 'integer', 'boolean', 'procedure', 'function', 
  'begin', 'end', 'if', 'then', 'else', 'while', 'do',
  'writeln', 'break', 'continue', 'return', 'true', 'false',
  'not', 'and', 'or'
];

const Operators = {
  ASSIGN: ':=',
  PLUS: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  EQUAL: '=',
  NOT_EQUAL: '<>',
  LESS_EQUAL: '<=',
  GREATER_EQUAL: '>=',
  LESS: '<',
  GREATER: '>',
  AND: 'and',
  OR: 'or',
  NOT: 'not'
};

const Punctuation = {
  SEMICOLON: ';',
  COMMA: ',',
  DOT: '.',
  LPAREN: '(',
  RPAREN: ')',
  COLON: ':'
};

module.exports = {
  TokenType,
  Keywords,
  Operators,
  Punctuation
};