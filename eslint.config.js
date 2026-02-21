import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        ignores: ['node_modules/', 'dist/'],
    },
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'warn',
            eqeqeq: 'error',
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    prettierConfig,
];
