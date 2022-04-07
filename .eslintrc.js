module.exports = {
    'env': {
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:security/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'rules': {
        'indent': ['error', 4, {'SwitchCase': 1}],
        'semi': 'off',
        '@typescript-eslint/semi': ['error'],
        'quotes': ['error', 'single'],
        'no-process-env': ['error']
    }
};
