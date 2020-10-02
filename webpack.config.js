const path = require("path");

module.exports = {
    target: 'node',
    entry: {
        glossajs: './app.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'glossajs.js',
        library: 'GlossaJS',
    },

  
}