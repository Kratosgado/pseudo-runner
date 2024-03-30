import { Diagnostic, DiagnosticSeverity } from "vscode-languageclient/node";
import { validateIdentifierSyntax } from "./customRegex";

export async function validateForLoop(line: string, i: number): Promise<Diagnostic | null> {
    // Check for correct syntax: for <variable><optional = <start>> to <end> <optional<step> <value>> do
    const match = line.match(/for (\w+)(?:\s*=)? *(?:(\d+))? *to *(\d+|[\w]+)(?:\s*step\s*(\d+))? *do/i);
    if (!match) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: 0 },
                end: { line: i, character: line.length }
            },
            message: `Invalid for loop syntax at line ${i + 1}`
        };
    }
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

    // Return null if no issues were encountered during validation
    return null;
}
