/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    'no-unreachable': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
    'react-hooks/rules-of-hooks': 'error',

    // Keep lint green while we incrementally type and clean up the repo.
    // (Warnings still surface in CI/local without blocking commits.)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    'react/no-unescaped-entities': 'warn',
  },
};
