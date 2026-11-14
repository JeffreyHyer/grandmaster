import neostandard from 'neostandard'

export default [
  { ignores: ['node_modules/**', 'vendor/**', 'data/**'] },
  ...neostandard({ ts: true }),
  {
    rules: {}
  }
]
