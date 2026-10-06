import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { parse } from 'acorn';

const code = readFileSync(resolve(__dirname, '../dist/index.js'), 'utf8');

function legacyRuntime() {
    const context = createContext({ exports: {} });
    // Exercise the published CommonJS file without ES2015 built-ins or require.
    runInContext(
        `Number.isNaN = undefined;
         Object.assign = undefined;
         Object.getOwnPropertySymbols = undefined;
         Symbol = undefined;`,
        context
    );
    runInContext(code, context);
    return context;
}

describe('Published package', () => {
    test('contains only ES5 JavaScript syntax', () => {
        expect(() => parse(code, { ecmaVersion: 5 })).not.toThrow();
    });

    test('prints valid and invalid dates without Number.isNaN', () => {
        const context = legacyRuntime();
        expect(
            runInContext('exports.prettyPrint(new Date(NaN))', context)
        ).toBe('Invalid Date');
        expect(runInContext('exports.prettyPrint(new Date(0))', context)).toBe(
            "new Date('1970-01-01T00:00:00.000Z')"
        );
    });

    test('prints nested objects, arrays and circular references without symbols', () => {
        const context = legacyRuntime();
        const output = runInContext(
            `var value = { date: new Date(NaN), list: [1, 'two'] };
             value.self = value;
             exports.prettyPrint(value, { inlineCharacterLimit: 100 });`,
            context
        );
        expect(output).toBe(
            '{date: Invalid Date, list: [1, \'two\'], self: "[Circular]"}'
        );
        // A second call must not mistake this object for an ongoing traversal.
        expect(
            runInContext(
                'exports.prettyPrint(value, { inlineCharacterLimit: 100 })',
                context
            )
        ).toBe(output);
    });
});
