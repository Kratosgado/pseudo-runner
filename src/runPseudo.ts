import * as vscode from "vscode";
import { exec } from 'child_process';
import * as path from 'path';

// function to run the pseudo code, using the binary
export const runPseudo = async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const fileName = document.fileName;
        // check and get a terminal with the name "NASM Terminal"
        const existingTerminal = vscode.window.terminals.find((terminal) => terminal.name === 'Pseudo Runner');

        if (existingTerminal) {
            existingTerminal.sendText("clear");
            existingTerminal.sendText(`${path.join(__dirname, "pseudo_interpreter")} ${fileName}`);
        } else {
            // else create a new terminal with the name "NASM Terminal" and send the execCommand
            const terminal = vscode.window.createTerminal('Pseudo Runner');
            terminal.sendText(`${path.join(__dirname, "pseudo_interpreter")} ${fileName}`);
            terminal.show();
        }
    }
};