import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Exercise the real consumer of the scoped js-yaml override, not just YAML alone.
const { loadNycConfig } = createRequire(__filename)(
    '@istanbuljs/load-nyc-config'
);

test('coverage configuration still supports YAML inheritance with the security override', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'pretty-print-nyc-'));
    try {
        await writeFile(join(cwd, 'package.json'), '{}');
        await writeFile(
            join(cwd, 'base.yaml'),
            'all: true\ncheck-coverage: true\nbranches: 90\n'
        );
        await writeFile(
            join(cwd, '.nycrc.yaml'),
            'extends: ./base.yaml\ninclude:\n  - src/**/*.ts\nexclude: src/**/*.test.ts\n'
        );
        expect(await loadNycConfig({ cwd })).toEqual({
            cwd,
            all: true,
            checkCoverage: true,
            branches: 90,
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts']
        });
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
});
