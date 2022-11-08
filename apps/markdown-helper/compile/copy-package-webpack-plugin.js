const fs = require('fs')

class CopyPackageWebpackPlugin {
  _config = {}
  constructor(config) {
    this._config = config
  }
  apply(compiler) {
    compiler.hooks.done.tap('CopyPackageWebpackPlugin', stats => {
      console.log('---start CopyPackageWebpackPlugin')
      const data = fs.readFileSync('./package.json', 'utf8')
      const pkg = JSON.parse(data)
      fs.writeFileSync('./dist/package.json', JSON.stringify({...pkg, ...this._config}))

    })
  }
}


module.exports = CopyPackageWebpackPlugin