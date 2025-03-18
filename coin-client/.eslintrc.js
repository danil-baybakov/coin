// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  plugins: ['prettier', 'jest'],
  extends: ['eslint:recommended', 'prettier', 'plugin:jest/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-var': 'error',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
