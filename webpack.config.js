const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "bundle.js"
    },
    devtool: "source-map",
    target: "web",
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: "babel-loader",
            }
        ]
    },
    devServer: {
        host: "0.0.0.0",
        port: 9000,
        compress: true,
    },
};