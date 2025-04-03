module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
      'prettier',
  ],
  root: true,
  env: {
      node: true,
      jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'no-nested-ternary': 'warn',
      'arrow-parens': ['warn', 'always'],
      '@typescript-eslint/type-annotation-spacing': ['warn', {
          'before': false,
          'after': true,
          'overrides': {
              'arrow': {
                  'before': true,
                  'after': true
              }
          }
      }],
      'arrow-parens': ['warn', 'always'],
  },
};