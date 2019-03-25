// 购物车相关路由业务函数

/**购物车操作分为两种情况： 未登录  已登录
 * 未登录：购物车操作 存储在浏览器端，cookie更方便一些，只有cookie才能被node操作，localStorge和sessionStorge是通过前端js操作
 * 已登录：购物车操作 PHP服务器 mysql数据库存储
 * 怎么区分未登录和已登录状态 使用session，如果登录成功，用户的信息将会存在user这个字段中
 */

const configs = require('../configs')
const productModel = require('../models/product')
const cartModel = require('../models/cart')


exports.addCart = (req, res, next) => {
    /**刷新页面的时候会重复提交，因为走一个路由的时候，进行了两个业务，所以这两个业务要分开
     * 1.加入购物车
     * 2.渲染加入的商品信息及加入的数量
     */
    // 1.加入购物车
    // res.send('ok')
    // console.log('加入购物车');

    /**添加购物车的时候，先走这里，然后走success的路由，使用重定向 */
    // 重定向的时候，应该把id和数量携带过来一起提交
    const id = req.query.id //商品ID
    const num = req.query.num //添加的数量
    /**1.加入购物车 */
    if (!req.session.user) {
        // 未登录
        /**a.存储cookie cookie的存储格式是键值对字符串，约定好键=pyg64_cart_info，值json字符串数组[{id:10,num:1},{}...] */
        /**b.获取指定的cookie信息 cookie拿出来最好是对象，然后根据key获取，req.cookie需要一个中间件处理数据cookie-parser*/
        /**c. 获取指定数据req.cookie.pyg_cart_info这个是约定好的，可以理解成购物车的配置信息，把pyg_cart_info   cookie的有效期，有效期存多久是由产品决定的，当做购物车的配置信息*/
        /**d. 获取到的数据是json格式的字符串数组，需要转换成真正的数组才好操作，才好对数组进行修改*/
        /**e.json格式的字符串应该存商品的id，数量num
         * 添加商品  正常情况：直接添加就可以，特殊情况：如果遇见相同的商品，直接数量累加
         */
        /**f. 修改完内存中的数组，把修改好的数组，存储到cookie中，更新cookie信息*/
        /**g.重定向，添加成功展示页面 */
        const cartCookie = req.cookies[configs.cartCookie.key] || '[]' //给一个默认数据，否则转换报错
        const cartList = JSON.parse(cartCookie)
        // 判断当前的数据中有没有数据，根据id判断
        // 数组方法find，找到符合条件的元素，并返回该元素
        const item = cartList.find((item, i) => {
            item.id == id
        })
        if (item) {
            // 有相同的商品
            item.num = parseInt(item.num) + parseInt(num)
        } else {
            cartList.push({
                id,
                num
            })
            // console.log(cartList);

        }
        // 更新cookie
        // req是获取cookie，res是设置cookie
        // express官网->API->response->res.cookie(name, value [, options])
        const expires = new Date(Date.now() + configs.cartCookie.expires) //Date.now()是1970年1月1日0分0秒到现在的时间戳，然后加上设置的有效期，得到cookie的失效时间
        res.cookie(configs.cartCookie.key, JSON.stringify(cartList), {
            expires
        })
        res.redirect(`/cart/addCartSuccess?id=${id}&num=${num}`)
    } else {
        // 已登录
        // 登录状态下的添加购物车
        cartModel.add(req.session.user.id, id, num)
            .then(data => {
                // 添加成功
                res.redirect(`/cart/addCartSuccess?id=${id}&num=${num}`)
            })
            .catch(err => next(err))
    }




}
exports.addCartSuccess = (req, res, next) => {
    // 2.渲染加入的商品信息及加入的数量(展示添加的商品)
    // res.send('ok')
    /**需要的数据id 名称 图片 数量，id和数量通过url可以拿到*/
    // 获取商品基本信息
    const {
        id,
        num
    } = req.query
    productModel.getProductBaseById(id)
        .then(data => {
            // res.json(data)
            // 简化需要的数据
            res.locals.product = {
                id: data.id,
                name: data.name,
                thumbnail: data.thumbnail,
                num
            }
            // res.json(res.locals.product)
            res.render('cart-add.art')
        })
        .catch(err => next(err))


    // res.render('cart-add.art')

}

// 展示购物车页面
exports.index = (req, res, next) => {
    // 打算异步获取数据，
    // 返回页面的时候，数据以json格式的字符串返回，只展示一个空壳，购物车的列表数据在客户端以ajax请求动态获取数据，页面先展示给客户端，数据通过ajax来拿
    // 负责返回静态页面
    // res.locals.user = req.session.user
    // res.send('ok')
    res.render('cart.art')
}
// 购物车列表数据以另外一个接口返回
exports.list = (req, res, next) => {
    // 负责返回购物车数据。格式是json，这是一个数据接口
    if (!req.session.user) {
        // 如果未登录从cookie中取数据，如果已登录，从服务器端获取数据
        // 未登录
        /**1. 获取cookie拿出字符串，转换成数组[{id:11,num:2},...] 不符合页面的要求，没有name,price等信息*/
        /**根据所有商品id获取 ，组织数组*/
        const cartCookie = req.cookies[configs.cartCookie.key] || '[]'
        const cartList = JSON.parse(cartCookie)
        // console.log(cartList);

        // 注意：有多个商品，要拿多个商品的数据
        // Promise.all(Promise数组)
        // 根据cartList里面的数据，返回一个获取商品数据的Promise数组
        // 遍历数组map的结果会返回一个新的数组
        const promiseArr = cartList.map((item, i) =>
            productModel.getProductBaseById(item.id)
        )
        Promise.all(promiseArr)
            .then(results => {
                res.json({
                    code: 200,
                    // 拿到的结果再遍历，取出num，amount等信息
                    list: results.map((item, i) => ({
                        id: item.id,
                        name: item.name,
                        thumbnail: item.thumbnail,
                        price: item.price,
                        num: +cartList[i].num, //把num统一转成数字
                        amount: item.amount //库存
                    }))
                })
            }).catch(err => {
                res.json({
                    code: 500,
                    msg: '获取购物车信息失败'
                })
            })
        // res.json({})
    } else {
        // 已登录
        // 获取账号下的购物车信息
        cartModel.list(req.session.user.id)
            .then(data => {
                res.json({
                    code: 200,
                    // 直接的data数据不符合我们的要求，我们要的数量是num,后台返回的是amount，需要重新遍历一下
                    list: data.map((item, i) => ({
                        id: item.id,
                        name: item.name,
                        thumbnail: item.thumbnail,
                        price: item.price,
                        num: item.amount,
                        amount: 100 //库存
                    }))
                })
            }).catch(err => {
                res.json({
                    code: 500,
                    msg: '获取购物车信息失败'
                })
            })
    }

}

// 修改购物车商品数量的接口，返回json
exports.edit = (req, res, next) => {
    // 修改需要传id和num
    // 约定传参： id num 请求方式post
    const {
        id,
        num
    } = req.body
    if (!req.session.user) {
        // 1.获取购物车数据，从cookie中拿
        const cartCookie = req.cookies[configs.cartCookie.key] || '[]' //给一个默认数据，否则转换报错
        const cartList = JSON.parse(cartCookie)
        // 2.修改
        const product = cartList.find((item, i) => item.id == id)
        product.num = +num //商品的num=传递过来的num，转换成数字类型传进去
        // 3.存起来
        const expires = new Date(Date.now() + configs.cartCookie.expires)
        res.cookie(configs.cartCookie.key, JSON.stringify(cartList), {
            expires
        })
        // 成功
        res.json({
            code: 200,
            msg: '修改成功'
        })
    } else {
        // 已登录
        // 登录状态下修改购物车数量
        cartModel.edit(req.session.user.id, id, num)
            .then(data => {
                res.json({
                    code: 200,
                    msg: '修改成功'
                })
            })
            .catch(err => {
                res.json({
                    code: 500,
                    msg: '修改失败'
                })

            })
    }
}



// 删除购物车商品接口，返回json
exports.remove = (req, res, next) => {
    // 从cookie中删除，根据id删除
    const id = req.body.id //商品id
    if (!req.session.user) {
        // 未登录
        // 操作cookie
        // 1.获取
        const cartCookie = req.cookies[configs.cartCookie.key] || '[]'
        const cartList = JSON.parse(cartCookie)
        // 2.删除
        // splice(index,1)删除数组中某一项
        const index = cartList.findIndex((item, i) => item.id == id)
        cartList.splice(index, 1)

        // 3.存储，重新计算当前的有效期
        const expires = new Date(Date.now() + configs.cartCookie.expires)
        res.cookie(configs.cartCookie.key, JSON.stringify(cartList), {
            expires
        })
        // 响应客户端
        res.json({
            code: 200,
            msg: '删除成功'
        })

    } else {
        // 已登录
        // 登录状态下删除购物车数量
        cartModel.remove(req.session.user.id, id)
            .then(data => {
                res.json({
                    code: 200,
                    msg: '删除成功'
                })
            })
            .catch(err => {
                res.json({
                    code: 500,
                    msg: '删除失败'
                })

            })
    }
}