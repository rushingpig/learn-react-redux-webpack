const webpack = requier('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');

const {fullPath,pickFiles} = require('./utils');
