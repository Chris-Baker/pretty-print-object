import { mkdir, rm, writeFile } from 'node:fs/promises';
import { transformFile } from '@swc/core';

// Keep ES5 output independently of TypeScript's supported compilation targets.
const { code } = await transformFile('src/index.ts', {
    jsc: {
        parser: { syntax: 'typescript' },
        target: 'es5',
        externalHelpers: false
    },
    module: { type: 'commonjs' }
});

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.js', code);
