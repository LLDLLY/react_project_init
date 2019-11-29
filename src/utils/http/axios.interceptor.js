import axios from 'axios';
import HeaderUtil from './header.util';
import CONSTANT from "./constant";
import { getCookie } from '../utils'
import baseUrl from '../setBaseUrl'

// axios 配置
axios.defaults.timeout = 50000;

axios.defaults.baseURL = baseUrl;

// 请求默认带上cookie
axios.defaults.withCredentials = true; 

axios.defaults.headers.common['sessionid'] = getCookie('token');

/**
 * 拦截发送请求
 */
axios.interceptors.request.use(config => {
        config.headers = HeaderUtil(config) || {};
        return config;
    }, error => {
        return Promise.reject(error);
    }
);

/**
 * 拦截响应
 */
axios.interceptors.response.use(response => {
        return response;
    }, error => {
        return Promise.reject(error);
    }
);

export function fetch(options) {
    return new Promise((resolve, reject) => {
        axios(options).then(response => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    })
}

export function getErrorReason(data) {
    let reason = null;
    let code = null;
    try {
        if (!data) return reason;
        let error = data.error;
        if (error) {
            error = JSON.parse(error);
            reason = error.reason || CONSTANT.ERROR_MESSAGE;
            code = error.code;
        } else {
            reason = data.reason || data.message || CONSTANT.ERROR_MESSAGE;
            code = 500;
        }
    } catch (e) {
        reason = CONSTANT.ERROR_MESSAGE;
        code = 500;
    }

    return {
        reason: reason,
        code: code
    };
}

export function fetchAll(requests) {
    return new Promise((resolve, reject) => {
        axios.all(requests).then(axios.spread(function (...response) {
            if (!response || response.length === 0) return;
            for(let i = 0; i < response.length; i++) {
                let response = response[i];
                if (!response) continue;
                if (response.status !== 200) {
                    new $message().error(CONSTANT.ERROR_MESSAGE);
                    break;
                }

                if (!response.data || response.data.status !== CONSTANT.SUCCESS) {
                    new $message().error(getErrorReason(response.data).reason);
                    break;
                }
            }
            resolve(response);
        })).catch((error) => {
            reject(error);
        });
    })
}

// export default axios;