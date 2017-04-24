const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: ["whatwg-fetch", "./src/index.js"],
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
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
    ],
    devServer: {
        host: "0.0.0.0",
        port: 9000,
        compress: true,
        // Test api
        proxy: {
            "/BRDRestService": "http://developer.itsmarta.com",
        }
    },
};