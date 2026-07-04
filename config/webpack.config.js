const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const paths = require('./paths');
const env = process.env.NODE_ENV;
const config = env === 'development'
    ? require('./development.js')
    : require('./production.js');

const { inject } = config;

const plugins = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: '**/*',
                globOptions: {
                    ignore: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.js', '**/*.ico', '**/*.scss']
                },
                transform: (content) => {
                    let changed = content.toString();
                    for (const key in inject) {
                        changed = changed.replace(`%${key}%`, inject[key]);
                    }
                    return changed;
                }
            },
            {
                from: '**/*.{png,jpg,jpeg,gif,ico}'
            }
        ]
    })
];

module.exports = {
    mode: env,
    context: paths.src,
    devtool: 'cheap-module-source-map',
    entry: paths.index,
    output: {
        path: paths.build,
        filename: 'main.js'
    },
    module: {
        strictExportPresence: true,
        rules: [{
            exclude: [
                /\.html$/,
                /\.js$/,
                /\.css$/,
                /\.scss$/,
                /\.json$/,
                /\.svg$/,
                /\.ico/,
                /\.bmp$/,
                /\.gif$/,
                /\.jpe?g$/,
                /\.png$/
            ],
            loader: require.resolve('file-loader'),
            options: {
                name: 'static/media/[name].[hash:8].[ext]'
            }
        }, {
            test: /\.js$/,
            include: paths.src,
            loader: require.resolve('babel-loader'),
            options: {
                presets: [['env', {
                    targets: {
                        uglify: true
                    }
                }]],
                cacheDirectory: true
            }
        }, {
            test: /\.(css|scss)$/,
            use: [
                require.resolve('style-loader'),
                {
                    loader: require.resolve('css-loader'),
                    options: {
                        modules: false,
                        sourceMap: false,
                        url: {
                            filter: (url) => !url.startsWith('data:')
                        }
                    }
                },
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        postcssOptions: {
                            plugins: [
                                require('cssnano'),
                                require('postcss-flexbugs-fixes'),
                                autoprefixer({
                                    overrideBrowserslist: [
                                        '>1%',
                                        'last 4 versions',
                                        'Firefox ESR',
                                        'not ie < 9'
                                    ],
                                    flexbox: 'no-2009'
                                })
                            ]
                        }
                    }
                }, {
                    loader: require.resolve('sass-loader'),
                    options: {
                        implementation: require('sass'),
                        api: 'modern'
                    }
                }
            ]
        }]
    },
    plugins: plugins,
    performance: {
        hints: false
    }
};
