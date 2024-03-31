// regex to match variables
export const regVar = /[a-zA-Z][a-zA-Z0-9_]*/;
const regNum = /\d+/;
const regOp = /[+-]/;
const regComparision = /(<|>|==|<=|>=)/;
const regExpr = new RegExp(`(${regVar.source}|${regNum.source}) *(${regOp.source} *(${regVar.source}|${regNum.source}))*`);

export const regDeclare = new RegExp(`declare\\s+(${regVar.source})\\s+as\\s+(\\w+)`, 'i');
export const regForLoop = new RegExp(`for +(${regVar.source}) *(= +(${regExpr.source}))? +to +(${regExpr.source}) +(step +(${regExpr.source}))? +do`, 'i');

export const regIfElse = new RegExp(`if +(${regExpr.source}) *${regComparision.source} *(${regExpr.source}) +then`, 'i');
export const regWhile = new RegExp(`while +(${regVar.source}) +${regComparision.source} +(${regExpr.source}) +do`, 'i');
/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}