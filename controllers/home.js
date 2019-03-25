// 定义和首页相关的路由函数
const settingsModel = require('../models/settings')
const productModel = require('../models/product')

// 渲染首页
exports.index = (req, res, next) => {
    // 渲染主页之前需要处理以下内容
    /**1. 轮播图数据获取 */
    // settingsModel.getSliders().then(data => {
    //     res.locals.sliders = data //挂载数据
    //     // res.json(res.locals) // 测试数据，展示一下
    //     res.render('home.art')
    // }).catch(err => next(err))

    // /**2. 猜你喜欢数据获取 */
    // productModel.getLikeProducts().then(data => {
    //     // 数据处理
    //     res.render('home.art')
    // }).catch(err => next(err))
    // 每次都要返回页面，是不可以的，既要请求轮播图数据，，又要请求猜你喜欢数据，而且要等最慢的执行完毕之后，把两个结果合在一起，再返回页面，
    // Promise.all() 可以执行多个异步操作promise操作，而且会等最慢的异步结果返回，才会去调用成功的回调(即.then)
    // Promise.race() 可以执行多个异步操作promise操作，只要有异步操作返回结果，就会去调用成功的回调
    // Promise.all() 传参：promise数组
    /**1. 轮播图数据获取 */
    /**2. 猜你喜欢数据获取 */
    Promise.all([settingsModel.getSliders(), productModel.getLikeProducts(6)])
        .then(result => {
            // result 是多个异步操作的返回结果的集合，类型是数组，结果的顺序和传入的顺序一致
            // res.json(result)
            res.locals.sliders = result[0]
            res.locals.likes = result[1]
            // res.json(res.locals)
            res.render('home.art')
        }).catch(err => {
            // 只要有一个promise失败，就会执行这个catch
            next(err)
        })
    /**3. 分类数据获取 */
}

// 返回猜你喜欢json格式的数据
exports.like = (req, res, next) => {
    productModel.getLikeProducts(6).then(data => {
        // 以json格式返回
        res.json({
            status: 200,
            result: data
        })
    }).catch(err => {
        // next走错误处理中间件  响应客户端的是错误页面
        // next(err)
        // 错误信息也应该以json格式返回，不走错误处理中间件
        // 为了区分是成功还是失败返回的数据，返回的时候传一个状态码
        res.json({
            status: 500,
            msg: err.message //ERROR对象中的错误信息是message属性
        })
    })
}