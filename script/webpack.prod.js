const webpack = require('webpack');
const path = require('path');

const commConfig = require('./webpack.common.js'); // 公共配置文件
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // webpack html插件
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin'); // webpack manifest插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin'); // webpack缓存插件, 使用service worker来缓存外部项目依赖项
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // webpack压缩插件


// const CleanWebpackPlugin = require('clean-webpack-plugin'); // webpack清除文件插件
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin'); // loadsh插件
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require('compression-webpack-plugin');

// 项目根目录
const rootPath = path.join(process.cwd()) + '/';
// package.json路径
const packagePath = path.join(rootPath, 'package.json');

const publicUrl = require(packagePath).url;

// const REACT_FRAME = /^_FRAME_REACT_/i;

const resolve = (dir) => {
  return path.resolve(process.cwd(), dir)
};

// webpack 配置区分环境 
// function getClientEnvironment(publicUrl) {
//   const raw = Object.keys(process.env)
//     .filter(key => REACT_FRAME.test(key))
//     .reduce(
//       (env, key) => {
//         env[key] = process.env[key];
//         return env;
//       },
//       {
//         NODE_ENV: process.env.NODE_ENV || 'dev',
//         PUBLIC_URL: publicUrl,
//       }
//     );

//   const stringified = {
//     'process.env': Object.keys(raw).reduce((env, key) => {
//       env[key] = JSON.stringify(raw[key]);
//       return env;
//     }, {}),
//   };

//   return { raw, stringified };
// }

// const env = getClientEnvironment(publicUrl);

// config
const config = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: resolve('dist'),
    filename: 'js/lib/[name].[hash].min.js',
    // publicPath: "/frame/",
    publicPath: `/${publicUrl}/`,
    // publicPath: path.resolve(__dirname, 'frame'),
    chunkFilename: 'js/file/[name].[chunkhash:8].chunk.js',
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: "all", // 必须三选一： "initial" | "all"(推荐) | "async" (默认就是async)
      minSize: 30000, // 最小尺寸，30000
      minChunks: 1, // 最小 chunk ，默认1
      maxAsyncRequests: 5, // 最大的异步请求数
      maxInitialRequests: 3, // 最大的初始请求数
      automaticNameDelimiter: '~', // 打包分隔符
      name: true, // 打包后的名称，此选项可接收 function
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true // 强制忽略minChunks等设置
        },

        svgs: {
          name: 'svgs',
          test: /\.svg$/,
          chunks: 'all',
          enforce: true // 强制忽略minChunks等设置
        },

        'ant-design': {
          test: /(@ant-design|ant-design)/,
          minChunks: 2,
          priority: 100,
          name: 'ant-design',
          chunks: 'async'
        },

        vendors: {
          chunks: 'all',
          test: /(react|react-dom|react-dom-router|babel-polyfill|mobx)/,
          priority: 100,
          name: 'vendors',
        },

        'async-commons': {
          chunks: 'async',
          minChunks: 2,
          name: 'async-commons',
          priority: 90,
        },

        commons: {
          chunks: 'all',
          minChunks: 2,
          name: 'commons',
          priority: 80,
        },
      }
    },

    minimizer: [
      new UglifyJsPlugin({
        exclude: /\.min\.js$/, // 过滤掉以".min.js"结尾的文件，我们认为这个后缀本身就是已经压缩好的代码，没必要进行二次压缩
        cache: true,
        parallel: true, // 开启并行压缩，充分利用cpu
        sourceMap: false,
        extractComments: false, // 移除注释
        uglifyOptions: {
          warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
          usedExports: true,
          output: {
            comments: false, // 删除所有的注释
            beautify: false,
            ascii_only: true,
          },
          compress: {
            drop_debugger: true,
            drop_console: true, // 删除所有的 `console` 语句
            collapse_vars: true, // 内嵌定义了但是只用到一次的变量
            conditionals: true,
            comparisons: false,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
            negate_iife: false // we need this for lazy v8
          },
        }
      }),
    ]
  },

  plugins: [

    //压缩CSS
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      mergeLonghand: false,
      autoprefixer: { disable: true }, // 禁用掉cssnano对于浏览器前缀的处理
      cssProcessorOptions: { discardComments: { removeAll: true }, safe: true },
      canPrint: true
    }),

    new webpack.optimize.ModuleConcatenationPlugin(),

    /*
    // 删除dist文件
    new CleanWebpackPlugin('dist', {
        root: __dirname,
        verbose: true, //输出删除信息
        dry: false // 删除文件  如果为true是模拟删除文件 不会真的删除文件
    }),
    */

    // 在编译阶段根据NODE_ENV自动切换配置文件
    // DefinePlugin 允许创建一个在编译时可以配置的全局常量
    // new webpack.DefinePlugin(env.stringified),

    new CompressionWebpackPlugin({ //gzip 压缩
        filename: '[path].gz[query]',
        test: new RegExp(
            '\\.(js|css)$'    //压缩 js 与 css
        ),
        threshold: 10240,
        minRatio: 0.8
    }), 

    // manifest
    new ManifestPlugin({
      fileName: 'manifest.json',
    }),

    // html
    new HtmlWebpackPlugin({
      chunksSortMode: 'none',
      filename: 'index.html',
      template: './src/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      // serviceWorkerLoader: `<script type="text/javascript" src="service-worker.js"></script>`
    }),

    // ignore
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // PWA(Progressive Web Apps, 渐进式网页应用)
    // webpack缓存插件, 使用service worker来缓存外部项目依赖项
    new SWPrecacheWebpackPlugin({
      cacheId: '_REACT_FRAME_FRAME_',
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      staticFileGlobs: ['dist/**/*.{js,html,css}'],
      stripPrefix: 'dist/',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: publicUrl + '/static/index.html',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),

    // new BundleAnalyzerPlugin()
  ]
};

module.exports = webpackMerge(commConfig, config); // 合并dev配置和公共配置

