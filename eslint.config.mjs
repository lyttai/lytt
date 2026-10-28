import next from 'eslint-config-next/core-web-vitals'
import ts from 'eslint-config-next/typescript'

const config = [...next, ...ts, { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'app/arlenshouse/src/**'] }, { rules: { 'no-console': 'error' } }, { files: ['app/api/**'], rules: { 'no-console': ['error', { allow: ['error'] }] } }]

export default config
