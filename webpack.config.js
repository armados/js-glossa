const path = require("path");

module.exports = {

    entry: {
        glossajs: './main.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'glossajs.js',
        library: 'GLO',
    },

    
}