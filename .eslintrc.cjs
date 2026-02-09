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
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      excludedFiles: [
        'src/ui/**/*',
        'app/providers-root.tsx',
        'src/components/pipeline.tsx',
        '**/__tests__/**/*',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@nextui-org/react',
                message:
                  'Import shared primitives from "@/ui" in feature code. Keep direct NextUI imports inside src/ui only.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/components/**/*.tsx'],
      excludedFiles: [
        '**/__tests__/**/*',
        '**/*.test.tsx',
        '**/*.spec.tsx',
      ],
      rules: {
        'no-restricted-syntax': [
          'warn',
          {
            selector: "JSXOpeningElement[name.name='input']",
            message: 'Prefer shared form primitives from "@/ui" over raw <input> controls in feature components.',
          },
          {
            selector: "JSXOpeningElement[name.name='select']",
            message: 'Prefer shared form primitives from "@/ui" over raw <select> controls in feature components.',
          },
          {
            selector: "JSXOpeningElement[name.name='textarea']",
            message: 'Prefer shared form primitives from "@/ui" over raw <textarea> controls in feature components.',
          },
        ],
      },
    },
  ],
};
