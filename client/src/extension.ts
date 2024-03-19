
import * as vscode from "vscode";
// import * as path from "path";
// import { workspace, ExtensionContext } from 'vscode';
// import { LanguageClientOptions, LanguageClient, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { runPseudo } from './runPseudo';

// let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// if the extension is launched in debug mode then the debug server options are used
	// otherwise the run options are used
	// const serverOptions: ServerOptions = {
	// 	run: {
	// 		command: path.join(__dirname, "server"),
	// 		args: [],
	// 		transport: TransportKind.stdio,
	// 	},
	// 	debug: {
	// 		command: path.join(__dirname, "server"),
	// 		args: [],
	// 		transport: TransportKind.stdio
	// 	},
	// };
	// const clientOptions: LanguageClientOptions = {
	// 	// register the server for plain text documents
	// 	documentSelector: [{ scheme: 'file', language: 'pseudo' }],
	// 	synchronize: {
	// 		// notify the server about file changes to '.clientrc files contained in the workspace
	// 		fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
	// 	}
	// };

	// // create the language client and start the client
	// client = new LanguageClient(
	// 	'pseudoRunner',
	// 	'Pseudo Runner',
	// 	serverOptions,
	// 	clientOptions
	// );

	// start the client. This will also launch the server
	// client.start();
	vscode.window.showInformationMessage("Pseudo Runner is now active!");

	context.subscriptions.push(vscode.commands.registerCommand('pseudoRunner.runPseudo', runPseudo));

}
export function deactivate() {

}

// // This method is called when your extension is deactivated
// export function deactivate(): Thenable<void> | undefined {
// 	if (!client) {
// 		return undefined;
// 	}
// 	return client.stop();
// }
