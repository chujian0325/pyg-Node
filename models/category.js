// 分类相关获取函数数据

// 获取所有的分类信息，数据结构是树状的
const axios = require('./axiosInstance')
exports.getCategoryTree = () => {
    return axios.get(`categories?format=tree`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

// 获取某一个分类及其父级分类
exports.getCategoryAndParent = (id) => {
    return axios.get(`categories/${id}?include=parent`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}