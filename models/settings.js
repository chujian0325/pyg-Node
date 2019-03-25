// 提供获取 设置相关数据 的函数
const axios = require('./axiosInstance')
// 5. 调用  提供一个获取数据的方法
exports.getSliders = () => {
    // axios.get()返回一个promise对象，这里return一个.then的返回值，也就是return了一个promise对象，所以getSliders就是一个获取 promise对象的函数，通过getSliders.then获取到的就是res.data 
    return axios.get('settings/home_slides')
        .then(res => res.data)
        .catch(err => Promise.reject(err))
    // .catch(err => return err) 会当做成功的回调
    // .catch(err => Promise.reject(err)) 只有主动调用错误回调方法，才会被下一个catch捕获
}