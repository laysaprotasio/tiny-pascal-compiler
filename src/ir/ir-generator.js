class IRBuilder {
  constructor() {
    this.code = [];
    this.tempCount = 0;
    this.labelCount = 0;
    this.loopStack = [];
  }

  emit(op, args = {}) {
    const instr = { op, ...args };
    this.code.push(instr);
    return instr;
  }

  newTemp() {
    this.tempCount += 1;
    return `t${this.tempCount}`;
  }

  newLabel(prefix = 'L') {
    this.labelCount += 1;
    return `${prefix}${this.labelCount}`;
  }
  label(name) {
    this.emit('label', { label: name });
  }

  goto(label) {
    this.emit('goto', { label });
  }
}

class TinyPascalIRGenerator {
  constructor() {
    this.builder = new IRBuilder();
  }

  generate(ast) {
    if (!ast || !ast.type) {
      throw new Error('AST inválido para geração de IR');
    }

    if (ast.type === 'Program') {
      return this.generateProgram(ast);
    }
    if (ast.type === 'Block') {
      this.generateBlock(ast);
      return this.builder.code;
    }

    throw new Error(`Nó raiz não suportado para geração de IR: ${ast.type}`);
  }

  generateProgram(program) {
    for (const decl of program.declarations || []) {
      if (decl.type === 'VarDeclaration') {
        this.builder.emit('decl', { idents: [...(decl.idents || [])], varType: decl.varType });
      } else if (decl.type === 'ProcedureDeclaration') {
        this.generateProcedure(decl);
      } else if (decl.type === 'FunctionDeclaration') {
        this.generateFunction(decl);
      }
    }

    this.builder.emit('section', { kind: 'main' });
    this.generateBlock(program.main);
    this.builder.emit('endsection', { kind: 'main' });
    return this.builder.code;
  }

  generateProcedure(procDecl) {
    const name = procDecl.name?.name || procDecl.name;
    this.builder.emit('section', { kind: 'procedure', name, params: this._collectParams(procDecl.params) });
    this.generateBlock(procDecl.body);
    this.builder.emit('endsection', { kind: 'procedure', name });
  }

  generateFunction(funcDecl) {
    const name = funcDecl.name?.name || funcDecl.name;
    this.builder.emit('section', {
      kind: 'function',
      name,
      params: this._collectParams(funcDecl.params),
      returnType: funcDecl.returnType,
    });
    this.generateBlock(funcDecl.body);
    this.builder.emit('endsection', { kind: 'function', name });
  }

  _collectParams(params = []) {
    const flat = [];
    for (const p of params) {
      for (const id of p.idents || []) {
        flat.push({ name: id, type: p.paramType });
      }
    }
    return flat;
  }

  generateBlock(block) {
    const statements = block.statements?.statements || block.statements || [];
    for (const stmt of statements) {
      this.generateStmt(stmt);
    }
  }

  generateStmt(stmt) {
    switch (stmt.type) {
      case 'Assign':
        return this.generateAssign(stmt);
      case 'Call':
        return this.generateCallStmt(stmt);
      case 'ReturnStmt':
        return this.generateReturn(stmt);
      case 'IfStmt':
        return this.generateIf(stmt);
      case 'WhileStmt':
        return this.generateWhile(stmt);
      case 'BreakStmt':
        return this.generateBreak(stmt);
      case 'ContinueStmt':
        return this.generateContinue(stmt);
      case 'WriteStmt':
        return this.generateWrite(stmt);
      case 'Block':
        return this.generateBlock(stmt);
      default:
        throw new Error(`Comando n\u00e3o suportado na gera\u00e7\u00e3o de IR: ${stmt.type}`);
    }
  }

  generateAssign(node) {
    const { place } = this.generateExpr(node.value);
    const target = node.target?.name || node.target;
    this.builder.emit('assign', { target, arg: place });
  }

  generateCallStmt(node) {
    const { result } = this.generateCall(node);
    return result;
  }

  generateReturn(node) {
    const { place } = this.generateExpr(node.value);
    this.builder.emit('return', { arg: place });
  }

  generateIf(node) {
    const { place: cond } = this.generateExpr(node.expr);
    const thenLabel = this.builder.newLabel('L_then_');
    const elseLabel = node.elseBranch ? this.builder.newLabel('L_else_') : null;
    const endLabel = this.builder.newLabel('L_end_');

    if (node.elseBranch) {
      this.builder.emit('if_goto', { cond, label: thenLabel });
      this.builder.goto(elseLabel);
      this.builder.label(thenLabel);
      this.generateBlock(node.thenBranch);
      this.builder.goto(endLabel);
      this.builder.label(elseLabel);
      this.generateBlock(node.elseBranch);
      this.builder.label(endLabel);
    } else {
      this.builder.emit('ifnot_goto', { cond, label: endLabel });
      this.generateBlock(node.thenBranch);
      this.builder.label(endLabel);
    }
  }

  generateWhile(node) {
    const start = this.builder.newLabel('L_while_start_');
    const end = this.builder.newLabel('L_while_end_');
    this.builder.label(start);
    this.builder.loopStack.push({ startLabel: start, endLabel: end });

    const { place: cond } = this.generateExpr(node.expr);
    this.builder.emit('ifnot_goto', { cond, label: end });
    this.generateBlock(node.doBranch);
    this.builder.goto(start);

    this.builder.loopStack.pop();
    this.builder.label(end);
  }

  generateBreak(_node) {
    const top = this.builder.loopStack[this.builder.loopStack.length - 1];
    if (!top) throw new Error("'break' fora de laço durante geração de IR");
    this.builder.goto(top.endLabel);
  }

  generateContinue(_node) {
    const top = this.builder.loopStack[this.builder.loopStack.length - 1];
    if (!top) throw new Error("'continue' fora de laço durante geração de IR");
    this.builder.goto(top.startLabel);
  }

  generateWrite(node) {
    for (const expr of node.arguments || []) {
      const { place } = this.generateExpr(expr);
      this.builder.emit('writeln', { arg: place });
    }
  }

  generateExpr(expr) {
    switch (expr.type) {
      case 'Number': {
        const t = this.builder.newTemp();
        this.builder.emit('const', { target: t, value: expr.value });
        return { place: t };
      }
      case 'Boolean': {
        const t = this.builder.newTemp();
        this.builder.emit('const', { target: t, value: expr.value ? 1 : 0 });
        return { place: t };
      }
      case 'Identifier': {
        const name = expr.name || expr;
        return { place: name };
      }
      case 'ParenExpr': {
        return this.generateExpr(expr.expr);
      }
      case 'Not': {
        const { place: a } = this.generateExpr(expr.factor);
        const t = this.builder.newTemp();
        this.builder.emit('unop', { op: 'not', arg: a, target: t });
        return { place: t };
      }
      case 'BinaryOp': {
        const { place: a } = this.generateExpr(expr.left);
        const { place: b } = this.generateExpr(expr.right);
        const t = this.builder.newTemp();
        this.builder.emit('binop', { op: expr.operator, left: a, right: b, target: t });
        return { place: t };
      }
      case 'Call': {
        return this.generateCall(expr);
      }
      default:
        throw new Error(`Expressão não suportada na geração de IR: ${expr.type}`);
    }
  }

  generateCall(callNode) {
    const callee = callNode.callee?.name || callNode.callee;
    const args = [];
    for (const argExpr of callNode.arguments || []) {
      const { place } = this.generateExpr(argExpr);
      args.push(place);
    }
    const t = this.builder.newTemp();
    this.builder.emit('call', { callee, args, target: t });
    return { place: t, result: t };
  }
}

module.exports = TinyPascalIRGenerator;
