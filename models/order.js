// 订单相关的接口调用
const axios = require('./axiosInstance')
// 添加订单
exports.add = (userId, items) => {
    // POST orders
    // https://ns-api.uieee.com/v1/orders
    return axios.post(`orders`, {
            user_id: userId,
            items
        })
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

// 查询单个订单
exports.item = (num) => {
    // GET orders/:num 
    // https://ns-api.uieee.com/v1/orders/:num
    return axios.get(`orders/${num}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}


// 修改单个订单
// PATCH orders/:num 
// https://ns-api.uieee.com/v1/orders/:num
exports.edit = (num, pay_status, trade_no) => {
    // GET orders/:num 
    // https://ns-api.uieee.com/v1/orders/:num
    return axios.pacth(`orders/${num}`, {
            pay_status,
            trade_no
        })
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}


// 查询全部订单
// GET orders 
// https://ns-api.uieee.com/v1/orders?user_id=1
exports.alllist = (userId) => {
    return axios.get(`orders?user_id=${userId}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}