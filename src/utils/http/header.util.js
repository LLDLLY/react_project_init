import { SYSTEM_UTIL, REQUEST } from "./constant";
import Base64 from '../base64'

/**
 * 获取请求头
 * config :
 * {
 *    url: '',
 *    method: '',
 *    data: {},
 *    callback: function() {},
 *    params: {},
 *    isNeedToken: false
 * }
 */
const HeaderUtil = (function () {

    function headerUtil(config) {
        this.config = config;
        if (!this.validateParams.call(this)) return;
        return this.getHeaders.call(this);
    }

    /**
     * 校验config参数
     */
    headerUtil.prototype.validateParams = function () {
        if (!this.config) return false; // 校验config
        if (!this.config.url) return false; // 校验url
        return true;
    };

    /**
     * 删除Cookie
     */
    headerUtil.prototype.deleteCookie = function () {
        Cookie.delete(REQUEST.CONTENT_TYPE_NAME); // 删除cookie中的content-type
        Cookie.delete(REQUEST.CONTENT_LENGTH_NAME);
    };

    /**
     * 获取请求头
     */
    headerUtil.prototype.getHeaders = function () {
        this.deleteCookie.call(this);
        let type = this.config.type || REQUEST.DEFAULT_URL_FORMAT;
        if (type.toUpperCase() === REQUEST.DEFAULT_URL_FORMAT) {
            type = REQUEST.DEFAULT_CONTENT_TYPE;
        } else if (type.toUpperCase() === REQUEST.FORM) {
            type = undefined;
        } else {
            type = REQUEST.DEFAULT_FORM_URLENCODED;
        }

        let headers = {};
        headers[REQUEST.X_REQUESTED_WITH] = REQUEST.DEFAULT_X_REQUESTED_WITH;
        headers[REQUEST.URL_TOKEN] = this.getToken(SYSTEM_UTIL.LOCAL_TOKEN) || "";

        if (type) {
            headers[REQUEST.CONTENT_TYPE_NAME] = type;
        }

        return headers;
    };

    /**
     * 设置cookie头
     */
    headerUtil.prototype.setCookieHeaders = function (response) {
        let headers = response.headers;
        if (!headers) return;
        let keys = headers.keys();
        if (!keys || keys.length === 0) return;

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (!key || key.toLowerCase() === SYSTEM_UTIL.AUTH_TOKEN.toLowerCase()) continue;
            Cookie.set(key, headers.get(key));
        }
    };

    /**
     * 从header中获取Token
     */
    headerUtil.prototype.setTokenByHeader = function (response, config) {
        let headers = response.headers;
        if (!headers) return;

        let header = null;
        try {
            header = headers.get(SYSTEM_UTIL.AUTH_TOKEN);
            if (!header) {
                header = headers.get(SYSTEM_UTIL.AUTH_TOKEN.toLowerCase());
            }
        } catch (e) {
            try {
                header = headers[SYSTEM_UTIL.AUTH_TOKEN];
                if (!header) {
                    header = headers[SYSTEM_UTIL.AUTH_TOKEN.toLowerCase()];
                }
            } catch (e) {
                header = null;
            }
        }

        if (!header) {
            return;
        }

        // set localStorage
        this.removeToken();
        this.setToken(null, header);
    };

    /**
     * 加密
     */
    headerUtil.prototype.encrypt = function (str) {
        if (!str) return;
        return Base64.encode(str);
    }

    /**
     * 解密
     */
    headerUtil.prototype.decrypt = function (str) {
        if (!str) return;
        return Base64.decode(str);
    }

    /**
     * 从localStorage中设置token
     */
    headerUtil.prototype.setToken = headerUtil.prototype.set = function (tokenName, item, needExpTime = false) {
        if (!item) return;

        if (needExpTime) {
            window.localStorage.setItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN, this.encrypt(JSON.stringify({
                data: item,
                time: new Date().getTime()
            })));
            return;
        }

        window.localStorage.setItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN, this.encrypt(item));
    };

    /**
     * 从localStorage中获取token
     */
    headerUtil.prototype.getToken = headerUtil.prototype.get = function (tokenName, needExpTime = false) {
        const item = window.localStorage.getItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN);
        if (!item) return null;
        if (!needExpTime) return this.decrypt(item);
        return item ? JSON.parse(this.decrypt(item)) : this.decrypt(item);
    };

    /**
     * 从localStorage中移除token
     */
    headerUtil.prototype.removeToken = headerUtil.prototype.remove = function (tokenName) {
        window.localStorage.removeItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN);
    };

    /**
     * 从sessionStorage中设置token
     */
    headerUtil.prototype.setSessionStorage = function (tokenName, item) {
        if (!item) return;
        if (typeof item !== 'string') {
            window.sessionStorage.setItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN, this.encrypt(JSON.stringify(item)));
        } else {
            window.sessionStorage.setItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN, this.encrypt(item));
        }
    };

    /**
     * 从sessionStorage中移除token
     */
    headerUtil.prototype.removeSessionStorage = function (tokenName) {
        window.sessionStorage.removeItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN);
    };

    /**
     * 从sessionStorage中获取token
     */
    headerUtil.prototype.getSessionStorage = function (tokenName) {
        const item = window.sessionStorage.getItem(tokenName || SYSTEM_UTIL.LOCAL_TOKEN);
        if (!item) return null;
        let data = null;
        try {
            data = JSON.parse(this.decrypt(item));
        } catch (e) {
            data = this.decrypt(item);
        }
        return data;
    };


    return headerUtil;

})();

export default function (config) {
    return new HeaderUtil(config);
}
