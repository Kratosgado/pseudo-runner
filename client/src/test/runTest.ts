import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // the folder containing the extension manifest package.json
        // passed to --extensionDevelopmentPath
        const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
    
        // the path to test runner
        // passed to --extentionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './index');
    
        // download vs code, unzip it and run the integration test
        await runTests({ extensionDevelopmentPath, extensionTestsPath });
    } catch (error) {
        console.error('failed to run tests');
        process.exit(1);
    }
}