// 自定义中间件
const configs = require('./configs')
const categoryModel = require('./models/category')
const productModel = require('./models/product')
const cartModel = require('./models/cart')


/** 配置网站公用信息的方法 */
exports.global = (req, res, next) => {
    // 1. 网站公用的头部信息
    res.locals.site = configs.site
    // 3. 用户信息
    res.locals.user = req.session.user
    // 2. 分类信息
    // 2.1 问题：每一次请求，都会去获取分类数据，想做缓存
    // 2.2 获取一次分类数据，就缓存起来，可以存在内存中，用一个全局变量保存起来，这里不能用cookie、session等，因为这是浏览器提供的API
    // 2.3 global这个全局对象是暴露给所有的程序使用，这里的内容可能会被其他程序覆盖，不建议在这里保存
    // 2.4 req和res对象，每次请求都会重新创建，可以存在req.app里面，启动web应用的时候，会创建app，一个应用只有一个app，可以
    // 2.5 思路：如果缓存中有数据，就走缓存，没有，就发请求给接口服务器获取
    if (req.app.locals.categoryTree) {
        res.locals.categoryTree = req.app.locals.categoryTree
        next()
    } else {
        categoryModel.getCategoryTree()
            .then(data => {
                // 拿到数据之后，做缓存
                req.app.locals.categoryTree = data
                res.locals.categoryTree = data
                next()
            }).catch(err => next(err))
        // 在处理路由之前，调用一下这个全局方法即可
    }
}
// 定义登录拦截中间件
exports.checkLogin = (req, res, next) => {
    // 登录拦截，很多地方都要登录拦截，可以定义一个登录拦截中间件
    if (!req.session.user) {
        // 如果没有登录，则重定向到登录页面，携带当前的url后面好回跳，url中如果有参数，最好用url编码转码
        return res.redirect('/login?returnUrl=' + encodeURIComponent(req.url))
    }
    next()
}


// 定义一个头部购物车信息中间件
exports.headCart = (req, res, next) => {
    // 获取网页头部购物车需要的数据
    // 需要商品的总数量 和 商品的名称列表数组
    if (!req.session.user) {
        // cookie购物车
        const cartCookie = req.cookies[configs.cartCookie.key] || '[]'
        const cartList = JSON.parse(cartCookie)
        // reduce()数组的API，计算总和
        // arr.reduce((prev, item) => prev + item, 0)
        // prev是上次的返回结果，0是初始的prev，item是当前遍历的元素
        const cartNum = cartList.reduce((prev, item) => prev + parseInt(item.num), 0)
        // cartList存储的是商品的id，并没有商品的名称
        // 商品名称的数据得去取，所有的都要取
        const promiseArr = cartList.map((item, i) => productModel.getProductBaseById(item.id))
        Promise.all(promiseArr)
            .then(results => {
                // results是商品列表
                res.locals.headCart = {
                    cartNum,
                    cartList: results.map((item, i) => item.name)
                }
                next()
            }).catch(err => next(err))


    } else {
        // 服务器端的购物车
        // 登录了通过购物车里面的数据去拿
        cartModel.list(req.session.user.id)
            .then(data => {

                res.locals.headCart = {
                    cartNum: data.reduce((prev, item) => prev + parseInt(item.amount), 0),
                    cartList: data.map((item, i) => item.name)
                }
                next()
            }).catch(err => next(err))
    }
}