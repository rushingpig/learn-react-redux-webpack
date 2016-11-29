/**
 * @desc : 简单的工具类封装
 * @author : pigozhu
 * @Date : 2016/11/29 0029 13:48
 */
const glob = require('glob');
const path = require('path');
const ip   = require('ip');

exports = module.exports = class Utils {

    pickFiles(options) {
        let files = glob.sync(options.pattern);
        return files.reduce((data, filename) => {
            let matched = filename.match(options.id);
            let name    = matched[1];
            data[name]  = path.resolve(__dirname, filename);
        });
    }

    fullPath(dir) {
        return path.resolve(__dirname, dir);
    }

    getIP() {
        let IPV4      = '127.0.0.1';
        let ipAddress = ip.address();
        if (ipAddress) {
            IPV4 = ipAddress;
        } else {
            let os         = require('os');
            let interfaces = os.networkInterfaces();
            for (let key in interfaces) {
                interfaces[key].some(function (details) {
                    if (details.family == 'IPv4' && key == 'en0') {
                        IPV4 = details.address;
                        return true;
                    }
                });
            }
        }
        return IPV4;
    }
};
