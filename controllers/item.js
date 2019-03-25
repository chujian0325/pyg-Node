// 商品详情页相关路由函数
const productModel = require('../models/product')
exports.index = (req, res, next) => {
    /**需求
     * 1.面包屑导航 渲染
     * 2.商品基本信息 渲染
     * 3.商品图片 渲染
     * 4.商品简介
     * 5.相关商品列表(猜你喜欢) 渲染
     */
    /**接口products/:id?include=introduce,category,pictures */
    /**同时获取商品详情的数据和猜你喜欢的数据 */
    const id = req.params.id
    Promise.all([productModel.getProductById(id), productModel.getLikeProducts(5)])
        .then(result => {
            // res.json(result)
            // 商品详情数据
            res.locals.product = result[0]
            // 相关商品数据
            res.locals.other = result[1]

            res.render('item.art')

        }).catch(err => next(err))
}