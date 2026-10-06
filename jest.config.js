module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [
            '@swc/jest',
            { jsc: { parser: { syntax: 'typescript' } } }
        ]
    },
    collectCoverage: true,
    collectCoverageFrom: ['src/index.ts'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    snapshotFormat: { escapeString: true, printBasicPrototype: true }
};
