const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: ["whatwg-fetch", "./src/index.js"],
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "bundle.js"
    },
    mode: "development",
    devtool: "source-map",
    target: "web",
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: "babel-loader",
                exclude: /(mobx-react-devtools)/,
            },
            {
                test: /\.styl?$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            localIdentName: "[path][name]__[local]__[hash:base64:5]",
                        }
                    },
                    "stylus-loader",
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'GIFY_API_KEY': JSON.stringify("AFhyYxOJQn3B0feWaLWb88DF67k1jwxJ"),
        }),
    ],
    devServer: {
        host: "0.0.0.0",
        port: 9000,
        compress: true,
        historyApiFallback: true,
    },
};