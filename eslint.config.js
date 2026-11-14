const neostandard = require('neostandard')

module.exports = [
  { ignores: ['node_modules/**', 'vendor/**', 'data/**'] },
  ...neostandard({ files: ['**/*.js'] }),
  {
    rules: {}
  }
]
