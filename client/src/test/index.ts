import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
    // create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });
    mocha.timeout(100000);

    const testsRoot = __dirname;

    return new Promise((resolve, reject) => {
        const files = glob.sync('**.test.js', { cwd: testsRoot });
        // add files to the test suite
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
        try {
            // run the mocha test
            mocha.run(failures => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed`));
                } else {
                    resolve();
                }
            });
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}