const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('../parser/parser');
const { TinyPascalSemanticAnalyzer, SemanticError } = require('../semantics/semantic-analyzer');
const TinyPascalIRGenerator = require('./ir-generator');

// Uso: node src/ir/index.js [caminho/do/arquivo.tp]
// Se nenhum caminho for passado, usa example.tp na raiz do projeto.

// Pretty-printer for plain TAC (three-address code)
function printTAC(ir) {
  const lines = [];

  const emit = (s) => lines.push(s);

  const binOpToken = (op) => {
    // Keep Pascal-like operators for readability
    return op;
  };

  for (const ins of ir) {
    switch (ins.op) {
      // binary ops are encoded by overwriting op with the operator token
      case '+':
      case '-':
      case '*':
      case '/':
      case 'and':
      case 'or':
      case '=':
      case '<>':
      case '<':
      case '<=':
      case '>':
      case '>=': {
        emit(`${ins.target} := ${ins.left} ${ins.op} ${ins.right}`);
        break;
      }
      // unary not is similarly encoded by op = 'not'
      case 'not': {
        emit(`${ins.target} := not ${ins.arg}`);
        break;
      }
      case 'section': {
        if (ins.kind === 'function') {
          const ret = ins.returnType || 'integer';
          emit(`.func ${ins.name} returns ${ret}`);
        } else if (ins.kind === 'procedure') {
          emit(`.func ${ins.name} returns void`);
        } else if (ins.kind === 'main') {
          emit(`.entry`);
        }
        break;
      }
      case 'endsection': {
        if (ins.kind === 'function' || ins.kind === 'procedure') {
          emit(`.endfunc`);
        } else if (ins.kind === 'main') {
          // End of program
          emit(`return`);
        }
        break;
      }
      case 'label':
        emit(`${ins.label}:`);
        break;
      case 'goto':
        emit(`goto ${ins.label}`);
        break;
      case 'if_goto':
        emit(`if ${ins.cond} goto ${ins.label}`);
        break;
      case 'ifnot_goto':
        emit(`ifnot ${ins.cond} goto ${ins.label}`);
        break;
      case 'assign':
        emit(`${ins.target} := ${ins.arg}`);
        break;
      case 'const':
        emit(`${ins.target} := ${ins.value}`);
        break;
      case 'binop': {
        const op = binOpToken(ins.op);
        emit(`${ins.target} := ${ins.left} ${op} ${ins.right}`);
        break;
      }
      case 'unop': {
        if (ins.op === 'not') emit(`${ins.target} := not ${ins.arg}`);
        else emit(`${ins.target} := ${ins.op} ${ins.arg}`);
        break;
      }
      case 'writeln': {
        emit(`param ${ins.arg}`);
        emit(`call writeln, 1`);
        break;
      }
      case 'call': {
        const nargs = (ins.args || []).length;
        for (const a of ins.args || []) emit(`param ${a}`);
        if (ins.target) emit(`${ins.target} := call ${ins.callee}, ${nargs}`);
        else emit(`call ${ins.callee}, ${nargs}`);
        break;
      }
      case 'return': {
        if (ins.arg !== undefined && ins.arg !== null) emit(`return ${ins.arg}`);
        else emit(`return`);
        break;
      }
      case 'decl':
        // Declarations are metadata; skip in pure TAC output
        break;
      default:
        // Fallback: ignore unknown ops in TAC output
        break;
    }
  }

  console.log(lines.join('\n'));
}

// JSON-like readable list form (previous output style)
function printIRList(ir) {
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

function parseArgs() {
  const argv = process.argv.slice(2);
  let format = 'tac'; // default to TAC
  let fileArg = null;
  for (const a of argv) {
    if (a === '--tac' || a === '--format=tac') format = 'tac';
    else if (a === '--obj' || a === '--json' || a === '--format=obj' || a === '--format=json' || a === '--format=list') format = 'obj';
    else if (!a.startsWith('-') && !fileArg) fileArg = a;
  }
  return { format, fileArg };
}

function main() {
  const { format, fileArg } = parseArgs();
  const filePath = fileArg
    ? path.resolve(process.cwd(), fileArg)
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

    const irGen = new TinyPascalIRGenerator(analyzer.symbolTable);
    const ir = irGen.generate(ast);
    if (format === 'tac') printTAC(ir);
    else printIRList(ir);
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
