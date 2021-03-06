const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const res = p => path.resolve(__dirname, p);

// if you're specifying externals to leave unbundled, you need to tell Webpack
// to still bundle `react-universal-component`, `webpack-flush-chunks` and
// `require-universal-module` so that they know they are running
// within Webpack and can properly make connections to client modules:
const externals = fs
  .readdirSync(res('../node_modules'))
  .filter(x =>
    !/\.bin|react-universal-component|require-universal-module|webpack-flush-chunks/.test(x))
  .reduce((externalModules, mod) => {
    externalModules[mod] = `commonjs ${mod}`; // eslint-disable-line no-param-reassign
    return externalModules;
  }, {});

const context = path.resolve(__dirname, '../src');

module.exports = {
  name: 'server',
  target: 'node',
  devtool: 'source-map',
  // devtool: 'eval',
  entry: ['babel-polyfill', res('../server/render.js')],
  externals,
  output: {
    path: res('../buildServer'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    publicPath: '/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env'],
          },
        },
      },
      {
        oneOf: [
          {
            test: /\.css$/,
            resourceQuery: /^\?raw$/,
            use: [
              {
                loader: 'css-loader/locals',
                options: {
                  modules: false,
                  importLoaders: 1,
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
              },
              {
                loader: 'postcss-loader',
              },
            ],
          },
          {
            test: /\.css$/,

            use: [
              {
                loader: 'css-loader/locals',
                options: {
                  modules: true,
                  importLoaders: 1,
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
              },
              {
                loader: 'postcss-loader',
              },
            ],
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|mp4|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      /*  {
        test: /\.(svg)$/,

        use: [
          {
            loader: 'svg-url-loader',
            options: {
              noquotes: true
            },
          },
        ],
      }, */
    ],
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      _: path.resolve(context),
      components: path.resolve(context, 'components'),
      reducers: path.resolve(context, 'reducers'),
      actions: path.resolve(context, 'actions'),
      helpers: path.resolve(context, 'helpers'),
      assets: path.resolve(context, 'assets'),
      selectors: path.resolve(context, 'selectors'),
      api: path.resolve(context, 'api'),
      icons: path.resolve(context, 'components/modules/icons'),
    },
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};
