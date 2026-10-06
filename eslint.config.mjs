import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist/**', 'coverage/**']),
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        rules: {
            // The public serializer deliberately accepts arbitrary input values.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' }
            ]
        }
    },
    {
        files: ['**/*.test.ts'],
        rules: { '@typescript-eslint/no-empty-function': 'off' }
    },
    {
        files: ['**/*.js'],
        languageOptions: { sourceType: 'commonjs' },
        rules: { '@typescript-eslint/no-require-imports': 'off' }
    },
    prettier
]);
