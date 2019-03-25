// 商品列表相关路由方法
const productModel = require('../models/product')
const categoryModel = require('../models/category')
const paginationUtil = require('../utils/pagination')
// 按分类查询
exports.index = (req, res, next) => {
    // 获取某个分类下的商品列表(点的分类)
    // 获取客户端的传参
    // 如果是get ?id=10  req.query
    // 如果是post 参数看不见 req.body
    // 如果是url/10  req.params
    // res.json(req.params)
    const id = req.params.id
    const page = req.query.page || 1 //获取分页的页码
    const per_page = 5 //自己确定好的
    // commend 综合排序
    // quantity 销量排序
    // market_time 新品排序
    // -price 价格升序
    // price 价格降序
    const sort = req.query.sort || 'commend'
    /**
     * 需求
     * 1.列表信息
     * 2.分页信息
     * 3.面包屑导航
     * 4.排序信息
     */
    // productModel.getProductAndCategory(id, page, per_page)
    //     .then(data => {
    //         res.json(data)
    //     }).catch(err => next(err))
    // res.send('list')
    // 同时获取列表、分页和面包屑数据
    Promise.all([productModel.getProductAndCategory(id, page, per_page, sort), categoryModel.getCategoryAndParent(id)])
        .then(result => {
            // res.json(result)
            // 设置面包屑数据
            res.locals.breadcrumb = result[1]
            // 设置当前排序
            res.locals.sort = sort
            // 设置商品列表数据
            res.locals.list = result[0].list
            // 分页代码
            res.locals.pageHtml = paginationUtil({
                page: result[0].page,
                total: result[0].total,
                url: req.url
            })
            // artTemplate 输出的HTML格式的代码，默认是字符串输出，防止XSS攻击cross site script(防止和CSS混淆，简写XSS),使用时用@
            res.render('list.art')
        })
        .catch(err => next(err))
}


// 按搜索关键字查询
exports.search = (req, res, next) => {
    /**需求
     * 1.搜索框提示关键字
     * 2.原来的面包屑位置，是搜索提示
     * 3.排序的位置需要修改地址
     * 4.列表数据渲染
     * 5.分页渲染
     */
    // 关键字
    const q = req.query.q
    const sort = req.query.sort || 'commend'
    const page = req.query.page || 1
    const per_page = 5
    // 根据关键字查询查询商品列表数据和分页数据
    productModel.getProductBySearch(q, page, per_page, sort)
        .then(data => {
            // res.json(data)
            // 设置关键字信息
            res.locals.q = q
            // 排序
            res.locals.sort = sort
            // 列表数据
            res.locals.list = data.list
            // 分页
            res.locals.pageHtml = paginationUtil({
                page: data.page,
                total: data.total,
                url: req.url
            })
            res.render('list.art') // 和list的相似度很高，可以共用一个模板

        })
        .catch(err => next(err))
}