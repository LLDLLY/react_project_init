// 这里是一个默认的url，可以没有
let baseUrl = "";
switch (process.env.NODE_ENV) {
    case 'development':
        // 这里是本地的请求url    
        baseUrl = "http://localhost:8888"
        break;
    case 'production':

        // 生产环境url
        baseUrl = "http://pro.com/"

        if (process.env.VUE_APP_TITLE === 'test') {
            // 测试环境地址
            baseUrl = "http://test.com/";
        }

        if (process.env.VUE_APP_TITLE === 'uat') {
            // uat 环境地址
            baseUrl = "http://uat.com/";
        }
        break;
}

export default baseUrl;