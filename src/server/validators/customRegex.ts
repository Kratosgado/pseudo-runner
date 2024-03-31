// regex to match variables
export const regVar = /[a-zA-Z][a-zA-Z0-9_]+/;
const regNum = /\d+/;
const regOp = /[+-]/;
const regComparision = /(<|>|==|<=|>=)/;
export const regExpr = new RegExp(`(${regVar.source}|${regNum.source}) *(${regOp.source} *(${regVar.source}|${regNum.source}))*`);
// export const regForLoop = new RegExp(`for\\s+${regVar.source}\\s*(=\\s*${regNum.source})?\\s+to\\s+${regNum.source}\\s+(step\\s+${regNum.source})?\\s+do`, 'i');
export const regDeclare = new RegExp(`declare\\s+(\\w+)\\s+as\\s+(\\w+)`, 'i');
export const regForLoop = new RegExp(`for (${regVar.source})(?:\\s*=)? *(?:(\\d+))? *to *(${regExpr.source})(?:\\s*step\\s*(\\d+))? *do`, 'i');
export const regIfElse = new RegExp(`if +(${regExpr.source}) *${regComparision.source} *(${regExpr.source}) +then`, 'i');

/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}