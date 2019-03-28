const wp = require('@cypress/webpack-preprocessor');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const webpackOptions = {
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: 'src/tsconfig.e2e.json',
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.e2e.json',
            },
          },
        ],
      },
    ],
  },
};

const options = {
  webpackOptions,
};

module.exports = wp(options);
