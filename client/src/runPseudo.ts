import * as vscode from "vscode";
import { exec } from 'child_process';
import * as path from 'path';
import * as os from 'os';

// function to run the pseudo code, using the binary
export const runPseudo = async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const fileName = document.fileName;
        // check and get a terminal with the name "Pseudo Runner"
        const existingTerminal = vscode.window.terminals.find((terminal) => terminal.name === 'Pseudo Runner');

        // Determine the correct interpreter based on the OS
        let interpreter = "pseudo_interpreter";
        if (os.platform() === "win32") {
            interpreter += ".exe";
        } else if (os.platform() === "darwin") {
            interpreter += "_mac";
        }

        const command = `${path.join(__dirname, interpreter)} ${fileName}`;

        if (existingTerminal) {
            existingTerminal.sendText("clear");
            existingTerminal.sendText(command);
        } else {
            // else create a new terminal with the name "Pseudo Runner" and send the execCommand
            const terminal = vscode.window.createTerminal('Pseudo Runner');
            terminal.sendText(command);
            terminal.show();
        }
    }
};