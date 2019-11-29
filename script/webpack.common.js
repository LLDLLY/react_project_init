const webpack = require('webpack');
const path = require('path');

const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'prod'; // 是否是生产环境, 测试环境需要显示源码

const resolve = (filePath) => {
  return path.resolve(process.cwd(), filePath);
}

const rules = [
  {
    test: /\.js$/,
    include: resolve('src'),
    exclude: resolve('node_modules'),
    loaders: ['babel-loader?cacheDirectory'],
  },
  {
    test: /\.css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: process.env.NODE_ENV === 'dev',
        }
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: false,
          importLoaders: 1
        }
      },
      'postcss-loader'
    ],
  },
  {
    test: /\.less$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: process.env.NODE_ENV === 'dev',
        }
      },
      'css-loader',
      'less-loader'
    ]
  },
  {
    test: /\.scss$/,
    use: [{
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: process.env.NODE_ENV === 'dev',
      }
    }, 'css-loader', 'sass-loader']
  },
  {
    test: /\.(jpg|jpeg|png|gif)$/,
    loader: 'url-loader',
    query: {
      limit: 10000,
      name: 'assets/img/[name]-[hash].[ext]',
      emitFile: true,
    }
  },
  {
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: 'assets/media/[name]-[hash].[ext]',
      emitFile: true,
    }
  },
  {
    test: /\.(woff|woff2|eot|ttf|svg)(\?.*$|$)/,
    loader: 'url-loader',
    options: {
      limit: 80000,
      name: 'assets/font/[name]-[hash].[ext]',
      emitFile: true,
    }
  }
]

const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),        // 在热加载时直接返回更新文件名，而不是文件的id
  new htmlWebpackPlugin({
    filename: 'index.html',
    template: './src/index.html'
  }),

  // 分离css成单独文件
  new MiniCssExtractPlugin({
    filename: 'assets/css/[name].[hash].css',
    // chunkFilename: 'assets/css/[id].[hash].css',
  }),

  // 自动加载模块，而不必到处 import 或 require 。
  // new webpack.ProvidePlugin({ 
  //     $message: [resolve('src/modules/components/message/message.js'), 'default'],
  //     // $tooltip: [resolve('src/modules/components/tooltip/tooltip.js'), 'default'],
  //     $modal: [resolve('src/modules/components/modal/modal.js'), 'default'],
  //     $map: [resolve('src/modules/common/util/map.js'), 'default'],
  // }),
]

const devServer = {
  historyApiFallback: true, // 任意的404响应都可能需要被替代为index.html
  contentBase: path.resolve(__dirname, 'build'),
  host: 'localhost',
  port: 8888,
  hot: true,
  inline: true,
  // publicPath: "/frame-mobile",
  overlay: {
    warnings: true,
    errors: true
  },
  compress: true,
  // proxy: proxySetting // 代理, 在package.json的proxy中配置
}

// webpack配置
const config = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'source-map',
  entry: './src/index.js',
  output: {
    path: resolve('dist'),
    filename: '[name].min.js',
  },
  module: {
    rules,
  },
  resolve: {
    // 设置别名
    alias: {
      '@': resolve('src')// 这样配置后 @ 可以指向 src 目录
    }
  },
  plugins,
  devServer
};

module.exports = config;
