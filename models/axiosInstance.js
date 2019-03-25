const {api} = require('../configs')
// 通过axios去请求php-server接口服务器
// 1. 安装axios  npm i axios
// 2. 导入
const axios = require('axios')
// 3. 要考虑每次请求必须授权
// 4. 所以创建新的axios实例,自定义配置
const instance = axios.create({
  baseURL: api.baseURL,
  // 超时时间
  timeout: api.timeout,
  // 配置上认证信息
  auth: {
    username: api.username,
    password: api.password
  }
})
module.exports = instance
