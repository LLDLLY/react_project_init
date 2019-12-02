const webpack = require('webpack');
const path = require('path');

const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HappyPack = require('happypack');
const os = require('os'); // node 提供的系统操作模块

 // 根据我的系统的内核数量 指定线程池个数 也可以其他数量
 const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length});

const isProd = process.env.NODE_ENV === 'prod'; // 是否是生产环境, 测试环境需要显示源码

const resolve = (filePath) => {
  return path.resolve(process.cwd(), filePath);
}

const rules = [
  {
    test: /\.js$/,
    include: resolve('src'),
    exclude: resolve('node_modules'),
    use: 'happypack/loader?id=babel',
    // loaders: ['babel-loader?cacheDirectory'],
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

  new HappyPack({ // 基础参数设置
    id: 'babel', // 上面loader?后面指定的id
    loaders: ['babel-loader?cacheDirectory'], // 实际匹配处理的loader
    threadPool: happyThreadPool,
    // cache: true // 已被弃用
    verbose: true
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
    modules: [ // 优化模块查找路径
      resolve('src'),
      resolve('node_modules') // 指定node_modules所在位置 当你import 第三方模块时 直接从这个路径下搜索寻找
    ],
    // 设置别名
    alias: {
      '@': resolve('src')// 这样配置后 @ 可以指向 src 目录
    },
    // 当引入模块时不带文件后缀 webpack会根据此配置自动解析确定的文件后缀
    extensions: ['.js']
  },
  plugins,
  devServer
};

module.exports = config;
