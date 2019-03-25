// 用户相关接口操作
const axios = require('./axiosInstance')
exports.login = (username, password) => {
    return axios.post(`users/login`, {
            username,
            password
        })
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}