const path = require("path");

module.exports = {
    entry: {
        glossajs: './app.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'glossajs.js',
        library: 'GlossaJS'
    },

    externals: {
        "fs": "require('fs')",
        "path": "require('path')"
    }
  
}