const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: ["./src/index.ts"],
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "bundle.js"
    },
    mode: "development",
    devtool: "source-map",
    target: "web",
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
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
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
    ],
    devServer: {
        host: "0.0.0.0",
        port: 9000,
        compress: true,
        historyApiFallback: true,
        // Test api
        proxy: {
            "/BRDRestService": "http://developer.itsmarta.com",
        }
    },
};