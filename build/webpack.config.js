const webpack = requier('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');

const {fullPath,pickFiles} = require('./utils');

const ROOT_PATH = fullPath('../');
const SRC_PATH = ROOT_PATH + '/src';
const DIST_PATH = ROOT_PATH + '/dist';

const NODE_MODULES_PATH = ROOT_PATH + '/node_modules';

const __DEV__ = process.env.NODE_ENV !== 'production';

let args = process.argv;

const uglify = args.indexOf('--uglify') > -1;

let alias = pickFiles({
    id : /(conf\/[^\/]+).js$]/,
    pattern : SRC_PATH + '/conf/*.js'
});

alias = Object.assign(alias,pickFiles({
    id : /(actions\/[^\/]+).js/,
    pattern : SRC_PATH + '/js/actions/*'
}));

alias = Object.assign(alias,{
    'react-router' : NODE_MODULES_PATH + '/react-router/lib/index.js',
    'react-redux' : NODE_MODULES_PATH + '/react-redux/lib/index.js',
    'redux' : NODE_MODULES_PATH + '/redux/lib/index.js',
    'redux-thunk' : NODE_MODULES_PATH + '/redux-thunk/lib/index.js'
});

const config = {
    context : SRC_PATH,
    entry :{
        app : [SRC_PATH + '/pages/app.js'],
        lib : [
            'react','react-dom','react-router',
            'redux','react-redux','redux-thunk'
        ]
    },
    output : {
        path : DIST_PATH,
        filename : __DEV__ ? 'js/[name].js' : 'js/[name].[chunkhash].js',
        chunkFilename : __DEV__ ? 'js/[name].js' : 'js/[name].[chunkhash].js'
    },
    module : {},
    resolve : {
        root : SRC_PATH,
        alias : alias
    },
    plugins : [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV" : JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names : ['lib','manifest']
        }),
        new HashedModuleIdsPlugin(),
        new WebpackMd5Hash()
    ]
};

//loaders
const CACHE_PATH = ROOT_PATH + '/cache';
config.module.loaders = [];

config.module.loaders.push({
    test : /\.js$/,
    exclude : /node_modules/,
    loaders : ['babel?cacheDirectory=' + CACHE_PATH]
});

if(__DEV__){
    config.module.loaders.push({
        test : /\.(scss | css)$/,
        loaders : ['style','css','postcss','sass']
    });
}else{
    config.module.loaders.push({
        test : /\.(scss | css)/,
        loader : ExtractTextPlugin.extract('sytle','css!postcss!sass')
    });
    config.plugins.push(
        new ExtractTextPlugin('css/[name].[contenthash].css')
    );
}

//css autoprefix

const precss = require('precss');
const autoprefixer = require('autoprefixer');
config.postcss = function(){
    return [precss,autoprefixer];
};

// 图片路径处理，压缩
config.module.loaders.push({
    test : /\.(?:jpg | png | svg)$/,
    loaders : [
        'url?limit=8000&name=img/[hash].[ext]',
        'image-webpack'
    ]
});

// 压缩js，css
if(uglify){
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress : {
                warning : false
            },
            output : {
                comments : false
            }

        })
    )
}

// 去掉重复模块
if(!__DEV__){
    config.plugins.push(
        new webpack.optimize.DedupePlugin()
    );
}

// html页面
const HtmlwebpackPlugin = require('html-webpack-plugin');
config.plugins.push(
    new HtmlwebpackPlugin({
        filename : 'index.html',
        chunks : ['app','lib'],
        template : SRC_PATH + '/pages/app.html',
        minify : __DEV__ ? false : {
            collapseWhitespace : true,
            collapseInlineTagWhitespace : true,
            removeRedundantAttributes : true,
            removeEmptyAttributes : true,
            removeScriptTypeAttributes : true,
            removeStyleLinkAttributes : true,
            removeComments : true
        }
    })
)

