import { fetch, fetchAll, getErrorReason } from './axios.interceptor';
import { SYSTEM_UTIL, CONSTANT, REQUEST } from './constant';
import HeaderUtil from './header.util';
import axios from 'axios';

export default class RequestService {

    static async request(method, config) {
        if (!config.url) return;

        if (config.type && (config.type.toUpperCase() === REQUEST.EXCEL || config.type.toUpperCase() === REQUEST.DOWNLOAD)) {
            config.responseType = REQUEST.BLOB;
        }

        let res = await fetch(this.getRequestHeader(config));

        if (res.status === REQUEST.SUCCESS_CODE) {
            try {
                if (config.type && (config.type.toUpperCase() === REQUEST.EXCEL || config.type.toUpperCase() === REQUEST.DOWNLOAD)) {
                    let str = res ? (res.data || "") : "";
                    let fileName = this.getExcelResponseHeader(res);
                    let body = str;
                    try {
                        let blob = new Blob([body], { type: REQUEST.TEXT_PLAIN });
                        let reader = new FileReader();
                        let _self = this;
                        reader.onload = function (e) {
                            let result = e.target[REQUEST.RESULT];
                            try {
                                if (!result) {
                                    return;
                                }
                                let body = result;
                                body = JSON.parse(body);
                            } catch (e) {
                                _self.exportExcel(str, config.data, fileName);
                            }
                        };
                        reader.readAsText(blob);
                    } catch (e) {
                        this.exportExcel(str, data, fileName);
                    }
                } else {
                    let response = res.data;
                    if (response.status !== CONSTANT.SUCCESS) {
                        let error = getErrorReason(response);
                        if (error.code === SYSTEM_UTIL.TOKEN_EXPIRED_CODE) {
                            new $message().error(CONSTANT.TOKEN_EXPIRED_ERROR);
                            setTimeout(function () {
                                window.location.href = SYSTEM_UTIL.PROJECT_PATH;
                            }, 1000);
                        } else {
                            new $message().error(error.reason);
                        }
                    } else {
                        if (config['params'] && config['params']['message']) {
                            new $message().success(config['params']['message']);
                        }
                    }

                    if (config && config['needToken']) {
                        HeaderUtil().setTokenByHeader(res, config);
                    }

                    if (!config.callback) return;
                    if (config['params']) {
                        config.callback(response, config['params']);
                        return;
                    }

                    return config.callback(response);
                }
            } catch (e) {
                new $message().error(CONSTANT.ERROR_MESSAGE);
                throw e;
            }

        } else {
            new $message().error(CONSTANT.ERROR_MESSAGE);
            Promise.reject(res);
            if (!config.callback) return;
            let res = {
                // status: 'error',
                code: 500
            };

            if (config['params']) {
                config.callback(res, config['params']);
                return;
            }

            config.callback(res);
        }
    }

    static exportExcel(body, data, fileName) {
        let blob = new Blob([body || ""], { type: REQUEST.EXCEL_TYPE });
        if (!fileName) {
            fileName = data ? data.fileName || SYSTEM_UTIL.DEFAULT_EXCEL_NAME : SYSTEM_UTIL.DEFAULT_EXCEL_NAME;
        }

        if (!fileName.endsWith(SYSTEM_UTIL.DEFAULT_EXCEL_SUFFIX)) {
            fileName += SYSTEM_UTIL.DEFAULT_EXCEL_SUFFIX;
        }
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    /**
     * 获取请求头
     */
    static getRequestHeader(config) {
        let option = {
            method: config.method || REQUEST.METHOD_POST,
            url: config.url,
            data: config.data || {},
            type: config.type,
            responseType: config.responseType,
            // headers: headers
        };

        if (!option.type) delete option.type;

        return option;
    }

    static getExcelResponseHeader(res) {
        if (res.status !== REQUEST.SUCCESS_CODE) return null;
        let headers = res.headers || {};
        let excelHeaderContentDisposition = headers[REQUEST.EXCEL_HEADER_CONTENT_DISPOSITION];
        if (!excelHeaderContentDisposition) return null;
        let arr = excelHeaderContentDisposition.split(";");
        let fileName = null;
        if (arr && arr.length > 0) {
            try {
                arr.map(item => {
                    if (item && item.indexOf('=') !== -1 && item.toUpperCase().indexOf(REQUEST.FILENAME) !== -1) {
                        let _arr = item.split('=');
                        fileName = _arr[_arr.length - 1];
                    }
                });
            } catch (e) {
                fileName = null;
            }
        }

        if (fileName) {
            fileName = fileName.replace(/\"/g, '');
        }

        return fileName;
    }


    /**
     * get请求
     * @param config
     */
    static get(config) {
        return this.request(REQUEST.METHOD_GET, config);
    }

    /**
     * post请求
     * @param config
     */
    static post(config) {
        return this.request(REQUEST.METHOD_POST, config);
    }

    /**
     * put请求
     * @param config
     */
    static put(config) {
        return this.request(REQUEST.METHOD_PUT, config);
    }

    /**
     * delete请求
     * @param config
     */
    static delete(config) {
        return this.request(REQUEST.METHOD_DELETE, config);
    }

    /**
     * 多个请求
     */
    static async all(config) {
        if (!config) return;

        let requires = config['requires'] || [];
        if (!requires || requires.length === 0) return;

        let requests = [];
        requires.map((item) => {
            let request = this.getRequestHeader(item);
            if (request) {
                requests.push(axios(request));
            }
        });

        let responses = await fetchAll(requests);
        if (!responses) return;

        for (let i = 0; i < requires.length; i++) {
            let require = requires[i];
            if (!require) continue;

            if (!require.callback) continue;
            if (require['params']) {
                require.callback(responses[i], require['params']);
                continue;
            }
            require.callback(responses[i].data);
        }
    }

}