const webpack = require('webpack');
const commConfig = require('./webpack.common.js'); // 公共配置文件
const path = require('path');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin'); // webpack manifest插件
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

// 项目根目录
const rootPath = path.join(process.cwd()) + '/';
// package.json路径
const packagePath = path.join(rootPath, 'package.json');
// package.json中的proxy代理
const proxySetting = require(packagePath).proxy;

const resolve = (dir) => {
  return path.resolve(process.cwd(), dir)
};

const config = {
  entry: {
    // 为热替换(HMR)打包好代码
    // only- 意味着只有成功更新运行代码才会执行热替换(HMR)
    index: [
      // '@babel/polyfill',
      'react-hot-loader/patch',// 开启 React 代码的模块热替换(HMR)
      'webpack/hot/only-dev-server',
      resolve('src/index.js'),
    ],
  },
  output: {
    path: resolve('dist'),
    filename: 'lib/[name].min.js',
    // publicPath: '/workflow',
  },
  optimization: {
    runtimeChunk: 'single',
    noEmitOnErrors: true,
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5, // 最大的异步请求数
      maxInitialRequests: 3, // 最大的初始请求数
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        "react-vendor": {
          test: (module) => (/react/.test(module.context) || /redux/.test(module.context)
            || /classnames/.test(module.context) || /prop-types/.test(module.context)),
          priority: 1,
          reuseExistingChunk: false
        },

        "react-dom": {
          // || /[\\/]node_modules[\\/]/.test(module.context)
          test: (module) => (/react-dom/.test(module.context)) || /react-router-dom/.test(module.context),
          priority: 3,
          reuseExistingChunk: false // 可设置是否重用该chunk
        },

        "axios": {
          // || /[\\/]node_modules[\\/]/.test(module.context)
          test: (module) => (/axios/.test(module.context)),
          priority: 5,
          reuseExistingChunk: true // 可设置是否重用该chunk
        },

        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          minSize: 30000,
          minChunks: 4,
          chunks: 'initial',
          priority: 1 // 该配置项是设置处理的优先级，数值越大越优先处理
        },

        commons: {
          minChunks: 2,
          name: 'commons',
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        },
      }
    },
  },

  plugins: [
    // 打开浏览器
    // new OpenBrowserPlugin({ url: 'http://localhost:8888' }),

    // 热部署
    new webpack.HotModuleReplacementPlugin(),

    // html
    new HtmlWebpackPlugin({
      chunksSortMode: 'none',
      filename: 'index.html',
      template: './src/index.html',
      inject: 'body',
    }),

    // manifest
    new ManifestPlugin({
      fileName: 'manifest.json',
    }),
  ],

  devServer: {
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
};

module.exports = webpackMerge(commConfig, config); // 合并dev配置和公共配置
