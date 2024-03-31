import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import { regDeclare, regVar } from "./customRegex";

//  const regOp = /[+\/-*]/;
// export const regExpr = new RegExp(`(${regVar.source}|${regNum.source})(${regOp.source}(${regVar.source}|${regNum.source}))*`);
const regForLoop = new RegExp(`for (${regVar.source})(?:\\s*=)? *(?:(\\d+))? *to *(\\d+|[\\w]+)(?:\\s*step\\s*(\\d+))? *do`, 'i');


// const EXPRESSION = *(?:(\d+|\w+|[\w+(+|-|*|/)\d+]))
export async function validateDeclare(line: string, i: number): Promise<Diagnostic | null> {

    // Check for correct syntax: declare <variable> as <type>
    const match = line.toLowerCase().match(regDeclare);
    if (!match) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: 8 },
                end: { line: i, character: line.length }
            },
            message: `Invalid declare statement syntax at line ${i + 1}`
        };
    }
    const [_, __, datatype] = match;
    if (!["INTEGER", "STRING", "DOUBLE"].includes(datatype.toUpperCase())) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: line.indexOf(datatype) },
                end: { line: i, character: line.indexOf(datatype) + datatype.length },
            },
            message: `Invalid datatype "${datatype}" for declare statement at line ${i + 1}. Must be one of INTEGER, STRING, DOUBLE.`
        };
    }
    return null;
}




export async function validateForLoop(line: string, i: number): Promise<Diagnostic | null> {

    // Check for correct syntax: for <variable><optional = <start>> to <end> <optional<step> <value>> do
    const match = line.match(regForLoop);
    if (!match) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: 0 },
                end: { line: i, character: line.length }
            },
            message: `Invalid for loop syntax at line ${i + 1}`
        };
    } else {
        const [__, variableName, startValue, endValue, stepValue] = match;

        // Ensure that the variable name matches the expected syntax for a valid variable name
        if (!validateIdentifierSyntax(variableName)) {
            return {
                severity: DiagnosticSeverity.Error,
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: variableName.length }
                },
                message: `Invalid variable name "${variableName}" at line ${i + 1}`
            };
        }

    }
    // Return null if no issues were encountered during validation
    return null;
}

/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}