
import * as path from "path";
import { workspace, ExtensionContext } from 'vscode';
import { LanguageClientOptions, LanguageClient, ServerOptions, TransportKind } from 'vscode-languageclient/node';

import * as vscode from 'vscode';
import { runPseudo } from './runPseudo';

let client: LanguageClient;

export function activate(context: ExtensionContext) {

	// the server is implemented in node
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
	// if the extension is launched in debug mode then the debug server options are used
	// otherwise the run options are used
	const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		},
	};
	const clientOptions: LanguageClientOptions = {
		// register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'pseudo' }],
		synchronize: {
			// notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// create the language client and start the client
	client = new LanguageClient(
		'pseudoRunner',
		'Pseudo Runner',
		serverOptions,
		clientOptions
	);

	// start the client. This will also launch the server
	client.start();
	vscode.window.showInformationMessage("Pseudo Runner is now active!");

	// listen for changes in the active text editor
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor && editor.document.languageId !== 'pseudo') {
			if (client) {
				client.stop();
				client = null;
			}
		}
	}, null, context.subscriptions);

	context.subscriptions.push(vscode.commands.registerCommand('pseudoRunner.runPseudo', runPseudo));

}

// This method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
