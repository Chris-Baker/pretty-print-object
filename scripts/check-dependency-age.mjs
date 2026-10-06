/* global AbortSignal, fetch, URL */

import { readFile } from 'node:fs/promises';
import { log } from 'node:console';

const lockfile = JSON.parse(
    await readFile(new URL('../package-lock.json', import.meta.url), 'utf8')
);
const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
const dependencies = Object.entries(lockfile.packages)
    .filter(([path]) => path !== '')
    .map(([path, dependency]) => ({
        name: dependency.name || path.split('node_modules/').at(-1),
        version: dependency.version
    }));
const names = [...new Set(dependencies.map(({ name }) => name))];
const publicationDates = new Map();
let next = 0;

// Check metadata before npm ci, including optional packages for other platforms.
await Promise.all(
    Array.from({ length: 8 }, async () => {
        while (next < names.length) {
            const name = names[next++];
            const response = await fetch(
                `https://registry.npmjs.org/${encodeURIComponent(name)}`,
                { signal: AbortSignal.timeout(30000) }
            );
            if (!response.ok) {
                throw new Error(
                    `Cannot verify ${name}: HTTP ${response.status}`
                );
            }
            const metadata = await response.json();
            publicationDates.set(name, metadata.time);
        }
    })
);

const failures = dependencies.flatMap(({ name, version }) => {
    const published = publicationDates.get(name)?.[version];
    const timestamp = Date.parse(published);
    if (!Number.isFinite(timestamp) || timestamp > cutoff) {
        return `${name}@${version}: ${published || 'publication date unknown'}`;
    }
    return [];
});

if (failures.length > 0) {
    throw new Error(
        `Dependencies must be at least seven days old:\n${failures.join('\n')}`
    );
}

log(
    `Verified ${dependencies.length} locked dependencies are at least seven days old.`
);
