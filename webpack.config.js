/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const path = require("path");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
    return {
        key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
        cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
    };
}

module.exports = async (env, options) => {
    const dev = options.mode === "development";
    const buildType = dev ? "dev" : "prod";
    const config = {
        devtool: "source-map",
        entry: {
            polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
            taskpane: "./src/taskpane/taskpane.js",
            autorunshared: "./src/runtime/autorunshared.js",
        },
        output: {
            devtoolModuleFilenameTemplate: "webpack:///[resource-path]?[loaders]",
            clean: true,
        },
        resolve: {
            extensions: [".html", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: "html-loader",
                },
                {
                    test: /\.(png|jpg|jpeg|gif|ico)$/,
                    type: "asset/resource",
                    generator: {
                        filename: "assets/[name][ext][query]",
                    },
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: "taskpane.html",
                template: "./src/taskpane/taskpane.html",
                chunks: ["polyfill", "taskpane"],
            }),
            new HtmlWebpackPlugin({
                filename: "autorunweb.html",
                template: "./src/runtime/autorunweb.html",
                chunks: ["polyfill", "autorunshared"],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: "assets/*",
                        to: "assets/[name][ext][query]",
                    },
                    {
                        from: "manifest*.xml",
                        to: "[name]" + "[ext]",
                        transform(content) {
                            if (dev) {
                                return content;
                            } else {
                                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
                            }
                        },
                    },
                ],
            }),
        ],
        devServer: {
            host: "0.0.0.0",
            allowedHosts: "all",
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            server: {
                type: "https",
                options: await getHttpsOptions(),
            },
            port: 3000,
        },
    };

    return config;
};
