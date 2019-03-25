// 购物车相关的接口操作
const axios = require('./axiosInstance')
// 添加
exports.add = (userId, id, num) => {
    return axios.post(`users/${userId}/cart`, {
            id,
            amount: num
        })
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

// 登录状态下的查询列表
exports.list = (userId) => {
    // GET users/:id/cart 
    return axios.get(`users/${userId}/cart`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

// 修改
exports.edit = (userId, id, num) => {
    // PATCH users/:id/cart/:cart_id
    return axios.patch(`users/${userId}/cart/${id}`, {
            amount: num
        })
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}


// 删除
exports.remove = (userId, id) => {
    // DEL users/:id/cart/:cart_id
    return axios.delete(`users/${userId}/cart/${id}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}