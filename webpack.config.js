const path = require("path");

module.exports = {

    entry: {
        glossajs: './src/main.js'
    },
    optimization: {
        minimize: false
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].min.js',
        library: 'GLO',
    },

    
}