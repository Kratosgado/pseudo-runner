
export const regVar = /[a-zA-Z][a-zA-Z0-9_]*/;
const regNum = /\d+/;
const regOp = /[+-]/;
const regComparision = /(<|>|==|<=|>=)/;
const regBinary = /(and|or)/i;
const regExpr = new RegExp(`(${regVar.source}|${regNum.source}) *(${regOp.source} *(${regVar.source}|${regNum.source}))*`);
const regBoolExpr = new RegExp(`(not )?(${regExpr.source} *${regComparision.source} *${regExpr.source}|${regVar.source}|true|false)`, 'i');
const regMultiBool = new RegExp(`${regBoolExpr.source}( +${regBinary.source} +${regBoolExpr.source})*`);

export const regDeclare = new RegExp(`declare\\s+(${regVar.source})\\s+as\\s+(\\w+)`, 'i');
export const regForLoop = new RegExp(`for +(${regVar.source}) *(= +(${regExpr.source}))? +to +(${regExpr.source}) +(step +(${regExpr.source}))? +do`, 'i');

export const regIfElse = new RegExp(`if +${regMultiBool.source} +then`, 'i');
export const regWhile = new RegExp(`while +${regMultiBool.source} +do`, 'i');

/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
export function validateIdentifierSyntax(identifier: string): boolean {
    return regVar.test(identifier);
}