import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import { regDeclare } from "./customRegex";

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



