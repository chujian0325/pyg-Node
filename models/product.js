const axios = require('./axiosInstance')
// 获取猜你喜欢的商品列表
exports.getLikeProducts = (limit) => {
    return axios.get(`products?type=like&limit=` + limit)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

// 获取分类下的商品列表 包含分页信息
exports.getProductAndCategory = (id, page, per_page, sort) => {
    return axios.get(`categories/${id}/products?page=${page}&per_page=${per_page}&sort=${sort}`)
        .then(res => ({
            list: res.data,
            page: +res.headers['x-current-page'],
            total: +res.headers['x-total-pages']
        })) //返回一个对象
        // page: res.headers['x-current-page'],得到的数据是字符串，要转换成数字
        // res是响应对象，理解成响应报文(有响应状态行、响应头、响应体)
        // res.data是响应体，是json数据
        // 分页信息在res.headers响应头中
        // "headers": {
        //     "host": "localhost:8000",
        //     "date": "Fri, 01 Mar 2019 10:40:14 +0800",
        //     "connection": "close",
        //     "x-powered-by": "PHP/7.1.25",
        //     "content-type": "application/json; charset=utf-8",
        //     "x-total-count": "40",
        //     "x-total-pages": "4",
        //     "x-limit-count": "10",
        //     "x-current-page": "1",
        //     "link": "<http://127.0.0.1:8000/index.php/v1/categories/1/products?page=2&per_page=10>; rel=next, <http://127.0.0.1:8000/index.php/v1/categories/1/products?page=4&per_page=10>; rel=last"
        //     }
        .catch(err => Promise.reject(err))
}



// 获取搜索关键字下的商品列表 包含分页信息
exports.getProductBySearch = (q, page, per_page, sort) => {
    // 接口，products
    // 地址栏传参，如果是中文字符或特殊字符，会解析异常
    // 一般url在传递数据的时候，要转成url编码encodeURIComponent 解码是decodeURIComponent
    q = encodeURIComponent(q)

    return axios.get(`products?page=${page}&per_page=${per_page}&sort=${sort}&q=${q}`)
        .then(res => ({
            list: res.data,
            page: +res.headers['x-current-page'],
            total: +res.headers['x-total-pages']
        }))
        .catch(err => Promise.reject(err))
}


// 获取商品详情根据id获取
exports.getProductById = (id) => {
    return axios.get(`products/${id}?include=introduce,category,pictures`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}



// 获取商品基本信息根据id获取
exports.getProductBaseById = (id) => {
    return axios.get(`products/${id}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}