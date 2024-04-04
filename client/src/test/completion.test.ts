
import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

suite("Should do completion", () => {
    const docUri = getDocUri('completion.ps');

    test('Completes test', async () => {
        await testCompletion(docUri, new vscode.Position(0, 0), {
            items: [
                { label: 'test', kind: vscode.CompletionItemKind.Text }
            ]
        });

    });
});
async function testCompletion(docUri: vscode.Uri, position: vscode.Position, expectedCompletionList: vscode.CompletionList) {
    await activate(docUri);
    // Get the completion items
    const result = (await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', docUri, position)) as vscode.CompletionList;
    assert.ok(result.items.length >= 1);
    expectedCompletionList.items.forEach((expectedItem, i) => {
        const actualItem = result.items[i];
        assert.equal(actualItem.label, expectedItem.label);
        assert.equal(actualItem.kind, expectedItem.kind);
    });

}