/** @type {import('eslint').Linter.Config} */
const config = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
  },
}

module.exports = config