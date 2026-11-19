import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const reactRules = {
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
    ...reactHooks.configs.recommended.rules,
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
};

const reactPlugins = {
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
};

export default tseslint.config(
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.3' } },
        plugins: reactPlugins,
        rules: {
            ...js.configs.recommended.rules,
            ...reactRules,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        settings: { react: { version: '18.3' } },
        plugins: reactPlugins,
        rules: {
            ...reactRules,
            // TypeScript checks prop types, so runtime PropTypes are not needed in .tsx files.
            'react/prop-types': 'off',
        },
    },
);
