const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('../parser/parser');
const { TinyPascalSemanticAnalyzer, SemanticError } = require('../semantics/semantic-analyzer');
const TinyPascalIRGenerator = require('./ir-generator');

// Uso: node src/ir/index.js [caminho/do/arquivo.tp]
// Se nenhum caminho for passado, usa example.tp na raiz do projeto.

function printIR(ir) {
  const opMap = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
    and: 'and',
    or: 'or',
    '=': 'eq',
    '<>': 'neq',
    '<': 'lt',
    '<=': 'le',
    '>': 'gt',
    '>=': 'ge',
  };

  function fmtVal(v) {
    if (typeof v === 'string') return `'${v}'`;
    if (typeof v === 'number') return String(v);
    if (v === null || v === undefined) return 'null';
    return `'${String(v)}'`;
  }

  function fmtArray(arr) {
    return `[ ${arr.map(fmtVal).join(', ')} ]`;
  }

  function fmtInstr(ins) {
    const op = ins.op;
    let outOp = op;
    let args = [];
    let result = undefined;

    if (opMap[op]) {
      outOp = opMap[op];
      args = [ins.left, ins.right];
      result = ins.target;
    } else if (op === 'unop' && ins.op === 'not') {
      outOp = 'not';
      args = [ins.arg];
      result = ins.target;
    } else if (op === 'assign') {
      outOp = 'mov';
      args = [ins.arg, ins.target];
    } else if (op === 'const') {
      outOp = 'const';
      args = [ins.value];
      result = ins.target;
    } else if (op === 'call') {
      outOp = 'call';
      args = [ins.callee, ...(ins.args || [])];
      result = ins.target;
    } else if (op === 'return') {
      outOp = 'ret';
      args = [ins.arg];
    } else if (op === 'writeln') {
      outOp = 'print';
      args = [ins.arg];
    } else if (op === 'goto') {
      outOp = 'jmp';
      args = [ins.label];
    } else if (op === 'if_goto') {
      outOp = 'br';
      args = [ins.cond, ins.label];
    } else if (op === 'ifnot_goto') {
      outOp = 'brfalse';
      args = [ins.cond, ins.label];
    } else if (op === 'label') {
      outOp = 'label';
      args = [ins.label];
    } else if (op === 'section' || op === 'endsection') {
      outOp = op;
      const a = [];
      if (ins.kind) a.push(ins.kind);
      if (ins.name) a.push(ins.name);
      args = a;
    } else if (op === 'decl') {
      outOp = 'decl';
      args = [ ...(ins.idents || []), ins.varType ? `:${ins.varType}` : '' ].filter(Boolean);
    } else if (op === 'binop') {
      // fallback when generator uses 'binop'
      outOp = opMap[ins.op] || ins.op;
      args = [ins.left, ins.right];
      result = ins.target;
    } else if (op === 'unop') {
      outOp = ins.op;
      args = [ins.arg];
      result = ins.target;
    }

    const parts = [`op: '${outOp}'`];
    parts.push(`args: ${fmtArray(args)}`);
    if (result !== undefined) parts.push(`result: '${result}'`);
    return `{ ${parts.join(', ')} }`;
  }

  console.log('code: [');
  for (const ins of ir) console.log('  ' + fmtInstr(ins) + ',');
  console.log(']');
}

function main() {
  const inputArg = process.argv[2];
  const filePath = inputArg
    ? path.resolve(process.cwd(), inputArg)
    : path.resolve(__dirname, '../../example.tp');

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const code = fs.readFileSync(filePath, 'utf-8');

  try {
    const lexer = new TinyPascalLexer(code);
    const tokens = lexer.tokenize();

    const parser = new TinyPascalParser(tokens);
    const ast = parser.parseProgram();

    const analyzer = new TinyPascalSemanticAnalyzer();
    analyzer.analyzeProgram(ast);

    const irGen = new TinyPascalIRGenerator();
    const ir = irGen.generate(ast);

    printIR(ir);
  } catch (e) {
    if (e instanceof SemanticError || e.name === 'SemanticError') {
      console.error(`Erro semântico: ${e.message}`);
    } else {
      console.error(`Erro: ${e.message}`);
    }
    process.exit(1);
  }
}

main();

