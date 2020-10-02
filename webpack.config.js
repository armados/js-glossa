const path = require("path");

module.exports = {
    target: 'web',
    entry: {
        glossajs: './app.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'glossajs.js',
        library: 'GlossaJS',
    },
    node: {
        fs: "empty"
    }
  
}